import React, { useState } from 'react';
import axios from 'axios';

const AppointmentBooking = ({ doctor, onClose }) => {
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const handleBookAppointment = async (e) => {
    e.preventDefault();

    if (!appointmentDate || !appointmentTime) {
      setError('Please select both date and time');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get the token from localStorage (saved during login)
      const token = localStorage.getItem('token');

      if (!token) {
        setError('You need to login first');
        return;
      }

      // Make the API request to book appointment
      const response = await axios.post(
        `${API_BASE_URL}/appointments`,
        {
          doctor_id: doctor.id,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          notes: notes,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setAppointmentDate('');
        setAppointmentTime('');
        setNotes('');
        
        // Close after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError(
        err.response?.data?.message || 'Failed to book appointment'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="float-right text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>

        {/* Success Message */}
        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Appointment Booked!
            </h2>
            <p className="text-gray-600">
              Your appointment has been confirmed. Closing in a moment...
            </p>
          </div>
        ) : (
          <>
            {/* Heading */}
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Book Appointment
            </h2>
            <p className="text-gray-600 mb-6">
              with Dr. {doctor.user?.name}
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Booking Form */}
            <form onSubmit={handleBookAppointment}>
              {/* Date Input */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Select a date from tomorrow onwards
                </p>
              </div>

              {/* Time Input */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Time
                </label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Available times: 09:00 - 17:00
                </p>
              </div>

              {/* Notes Input */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific symptoms or concerns?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 h-24 resize-none"
                />
              </div>

              {/* Doctor Info */}
              <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Specialization:</span>{' '}
                  {doctor.specialization?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Consultation Fee:</span> Rs
                  {doctor.consultation_fee}
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-bold text-lg disabled:opacity-50"
              >
                {loading ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentBooking;