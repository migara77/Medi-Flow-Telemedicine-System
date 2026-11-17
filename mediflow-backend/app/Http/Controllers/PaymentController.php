<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Get payment for appointment
     */
    public function getPayment($appointmentId)
    {
        $appointment = Appointment::findOrFail($appointmentId);

        if ($appointment->patient_id !== auth()->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $payment = Payment::where('appointment_id', $appointmentId)->first();

        if (!$payment) {
            $payment = Payment::create([
                'appointment_id' => $appointmentId,
                'patient_id' => auth()->user()->id,
                'amount' => 50.00, // Default consultation fee
                'status' => 'pending',
            ]);
        }

        return response()->json([
            'payment' => $payment,
            'appointment' => $appointment->load('doctor.user', 'doctor.specialization'),
        ]);
    }

    /**
     * Process payment
     */
    public function processPayment(Request $request)
    {
        $validated = $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|in:credit_card,debit_card,bank_transfer',
            'card_number' => 'nullable|string',
            'card_holder' => 'nullable|string',
        ]);

        $appointment = Appointment::findOrFail($validated['appointment_id']);

        if ($appointment->patient_id !== auth()->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Simulate payment processing (in production, use Stripe, PayPal, etc.)
        $transactionId = 'TXN-' . Str::uuid();

        // Generate QR code data
        $qrData = json_encode([
            'transaction_id' => $transactionId,
            'appointment_id' => $appointment->id,
            'patient' => auth()->user()->name,
            'doctor' => $appointment->doctor->user->name,
            'amount' => $validated['amount'],
            'date' => now()->toDateTimeString(),
        ]);

        // Create QR code (base64 encoded for storage)
        $qrCode = $this->generateQRCode($qrData);

        $payment = Payment::updateOrCreate(
            ['appointment_id' => $appointment->id],
            [
                'patient_id' => auth()->user()->id,
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'transaction_id' => $transactionId,
                'qr_code' => $qrCode,
                'qr_data' => $qrData,
                'status' => 'completed',
                'paid_at' => now(),
            ]
        );

        // Update appointment status
        $appointment->update(['status' => 'confirmed']);

        return response()->json([
            'message' => 'Payment processed successfully',
            'payment' => $payment,
            'qr_code' => $qrCode,
            'transaction_id' => $transactionId,
        ]);
    }

    /**
     * Generate QR code
     */
    private function generateQRCode($data)
    {
        // Using simple text-based QR code representation for demo
        // In production, use a library like endroid/qr-code
        $qrCode = base64_encode(json_encode([
            'type' => 'payment_confirmation',
            'data' => $data,
            'generated_at' => now()->toDateTimeString(),
        ]));

        return $qrCode;
    }

    /**
     * Get all payments for patient
     */
    public function myPayments()
    {
        $payments = Payment::where('patient_id', auth()->user()->id)
            ->with('appointment.doctor.user', 'appointment.doctor.specialization')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($payments);
    }

    /**
     * Verify payment QR code
     */
    public function verifyQRCode(Request $request)
    {
        $validated = $request->validate([
            'qr_code' => 'required|string',
        ]);

        try {
            $decoded = json_decode(base64_decode($validated['qr_code']), true);

            $payment = Payment::where('transaction_id', $decoded['data']['transaction_id'] ?? null)->first();

            if (!$payment) {
                return response()->json(['verified' => false, 'message' => 'Payment not found'], 404);
            }

            return response()->json([
                'verified' => true,
                'payment' => $payment,
                'appointment' => $payment->appointment->load('doctor.user'),
                'message' => 'Payment verified successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json(['verified' => false, 'message' => 'Invalid QR code'], 400);
        }
    }

    /**
     * Get all payments (Admin only)
     */
    public function getAllPayments()
    {
        $authUser = auth('api')->user();

        if ($authUser->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $payments = Payment::with('appointment.patient', 'appointment.doctor.user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($payments);
    }
}
