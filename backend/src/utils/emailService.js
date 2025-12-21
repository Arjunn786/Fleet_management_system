const nodemailer = require("nodemailer");
const logger = require("./logger");

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from:
        process.env.EMAIL_FROM ||
        "Fleet Management <noreply@fleetmanagement.com>",
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error("Email sending failed:", error);
    throw error;
  }
};

// Booking confirmation email
exports.sendBookingConfirmation = async (booking, user, vehicle) => {
  const subject = "Booking Confirmation - Fleet Management";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #667eea; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚘 Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear ${user.name},</p>
          <p>Your booking has been confirmed. Here are the details:</p>
          
          <div class="booking-details">
            <h3 style="color: #667eea; margin-top: 0;">Vehicle Details</h3>
            <div class="detail-row">
              <span class="label">Vehicle:</span>
              <span>${vehicle.make} ${vehicle.model} (${vehicle.year})</span>
            </div>
            <div class="detail-row">
              <span class="label">Type:</span>
              <span>${vehicle.vehicleType}</span>
            </div>
            <div class="detail-row">
              <span class="label">Registration:</span>
              <span>${vehicle.registrationNumber}</span>
            </div>
          </div>

          <div class="booking-details">
            <h3 style="color: #667eea; margin-top: 0;">Booking Details</h3>
            <div class="detail-row">
              <span class="label">Booking ID:</span>
              <span>${booking._id}</span>
            </div>
            <div class="detail-row">
              <span class="label">Start Date:</span>
              <span>${new Date(booking.startDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">End Date:</span>
              <span>${new Date(booking.endDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Pickup Location:</span>
              <span>${booking.pickupLocation.address}</span>
            </div>
            <div class="detail-row">
              <span class="label">Total Price:</span>
              <span style="font-size: 20px; font-weight: bold; color: #667eea;">$${
                booking.pricing.totalPrice
              }</span>
            </div>
          </div>

          <p>We look forward to serving you!</p>
          
          <div class="footer">
            <p>Fleet Management System<br>
            Questions? Contact us at support@fleetmanagement.com</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Booking Confirmation
    
    Dear ${user.name},
    
    Your booking has been confirmed.
    
    Vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.year})
    Booking ID: ${booking._id}
    Start Date: ${new Date(booking.startDate).toLocaleDateString()}
    End Date: ${new Date(booking.endDate).toLocaleDateString()}
    Pickup: ${booking.pickupLocation.address}
    Total Price: $${booking.pricing.totalPrice}
    
    Thank you for choosing Fleet Management!
  `;

  return sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
};

// Trip completion email
exports.sendTripCompletion = async (trip, user, vehicle) => {
  const subject = "Trip Completed - Fleet Management";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .trip-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #11998e; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .success-badge { background: #38ef7d; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Trip Completed!</h1>
        </div>
        <div class="content">
          <p>Dear ${user.name},</p>
          <p>Your trip has been successfully completed. Thank you for using our service!</p>
          
          <div class="trip-details">
            <h3 style="color: #11998e; margin-top: 0;">Trip Summary</h3>
            <div class="detail-row">
              <span class="label">Vehicle:</span>
              <span>${vehicle.make} ${vehicle.model}</span>
            </div>
            <div class="detail-row">
              <span class="label">Distance Covered:</span>
              <span>${trip.distance.actual || trip.distance.planned} km</span>
            </div>
            <div class="detail-row">
              <span class="label">Duration:</span>
              <span>${
                trip.startedAt
                  ? new Date(trip.startedAt).toLocaleDateString()
                  : "N/A"
              } - ${
    trip.completedAt ? new Date(trip.completedAt).toLocaleDateString() : "N/A"
  }</span>
            </div>
            <div class="detail-row">
              <span class="label">Total Amount:</span>
              <span style="font-size: 20px; font-weight: bold; color: #11998e;">$${
                trip.revenue || 0
              }</span>
            </div>
          </div>

          <p>We hope you had a great experience. Please consider leaving a review!</p>
          
          <div class="footer">
            <p>Fleet Management System<br>
            Questions? Contact us at support@fleetmanagement.com</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Trip Completed
    
    Dear ${user.name},
    
    Your trip has been successfully completed.
    
    Vehicle: ${vehicle.make} ${vehicle.model}
    Distance: ${trip.distance.actual || trip.distance.planned} km
    Total Amount: $${trip.revenue || 0}
    
    Thank you for using Fleet Management!
  `;

  return sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
};

// Trip cancellation email
exports.sendTripCancellation = async (booking, user, vehicle) => {
  const subject = "Booking Cancelled - Fleet Management";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Booking Cancelled</h1>
        </div>
        <div class="content">
          <p>Dear ${user.name},</p>
          <p>Your booking has been cancelled as requested.</p>
          
          <div class="details">
            <p><strong>Booking ID:</strong> ${booking._id}</p>
            <p><strong>Vehicle:</strong> ${vehicle.make} ${vehicle.model}</p>
            <p><strong>Cancelled on:</strong> ${
              booking.cancelledAt
                ? new Date(booking.cancelledAt).toLocaleDateString()
                : new Date().toLocaleDateString()
            }</p>
            ${
              booking.cancellationReason
                ? `<p><strong>Reason:</strong> ${booking.cancellationReason}</p>`
                : ""
            }
          </div>

          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <div class="footer">
            <p>Fleet Management System<br>
            Questions? Contact us at support@fleetmanagement.com</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Booking Cancelled
    
    Dear ${user.name},
    
    Your booking has been cancelled.
    
    Booking ID: ${booking._id}
    Vehicle: ${vehicle.make} ${vehicle.model}
    
    For assistance, contact support@fleetmanagement.com
  `;

  return sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
};

module.exports.sendEmail = sendEmail;
