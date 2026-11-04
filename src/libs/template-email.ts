export interface TransactionData {
  customerName: string;
  transactionId: string;
  status: "DONE" | "REJECTED";
  eventName: string;
  ticketCount: number;
  totalPrice: number;
}

const generateTransactionEmailHtml = (data: TransactionData): string => {
  const isApproved = data.status === "DONE";
  const statusColor = isApproved ? "#10B981" : "#EF4444"; // Hijau untuk Approve, Merah untuk Reject
  const statusText = isApproved ? "Telah Disetujui" : "Ditolak";
  const statusMessage = isApproved 
    ? "Terima kasih, pembayaran Anda telah berhasil kami verifikasi. Berikut adalah detail tiket Anda:"
    : "Mohon maaf, transaksi Anda tidak dapat kami proses saat ini. Pastikan pembayaran telah dilakukan dengan benar.";

  // Format angka ke Rupiah
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(data.totalPrice);

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Notifikasi Transaksi HA-RY Pass</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <div style="background-color: #111827; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">HA-RY Pass</h1>
      </div>

      <!-- Body -->
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; color: #374151; margin-top: 0;">Halo <strong>${data.customerName}</strong>,</p>
        <p style="font-size: 16px; color: #374151; line-height: 1.5;">Transaksi Anda dengan ID <strong>#${data.transactionId}</strong> statusnya saat ini adalah:</p>
        
        <!-- Status Badge -->
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; background-color: ${statusColor}; color: white; padding: 8px 24px; border-radius: 9999px; font-weight: bold; font-size: 16px; text-transform: uppercase;">
            ${statusText}
          </span>
        </div>

        <p style="font-size: 14px; color: #4B5563; line-height: 1.5; text-align: center; margin-bottom: 24px;">
          ${statusMessage}
        </p>

        <!-- Transaction Details -->
        <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; padding: 16px;">
          <h3 style="margin-top: 0; color: #111827; font-size: 16px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">Detail Transaksi</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Event Name</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: bold; text-align: right;">${data.eventName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Jumlah Tiket</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: bold; text-align: right;">${data.ticketCount}x</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6B7280; font-size: 14px; border-top: 1px solid #E5E7EB; padding-top: 12px; margin-top: 4px;">Total Harga</td>
              <td style="padding: 8px 0; color: #111827; font-size: 16px; font-weight: bold; text-align: right; border-top: 1px solid #E5E7EB; padding-top: 12px; margin-top: 4px;">${formattedPrice}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #F3F4F6; padding: 24px; text-align: center;">
        <p style="font-size: 12px; color: #6B7280; margin: 0;">Email ini dihasilkan secara otomatis, mohon tidak membalas email ini.</p>
        <p style="font-size: 12px; color: #9CA3AF; margin-top: 8px;">&copy; ${new Date().getFullYear()} HA-RY Pass. All rights reserved.</p>
      </div>

    </div>
  </body>
  </html>
  `;
};

export default generateTransactionEmailHtml;