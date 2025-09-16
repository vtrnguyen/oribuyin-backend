const { EmailTemplateType } = require('./constants.util');

const escapeHtml = (str = '') => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const wrapCard = (titleHtml, bodyHtml, footerHtml) => {
    return `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
    </head>
    <body style="margin:0;padding:20px;background:#f2f4f7;font-family:Arial,sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;">
        <tr>
          <td style="padding:0">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-radius:8px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.05);background:#ffffff;">
              <tr style="background:#017bbe;color:#ffffff">
                <td style="padding:18px 20px;">
                  <div style="font-size:18px;font-weight:600;">OriBuyin</div>
                </td>
              </tr>

              <tr>
                <td style="padding:20px;">
                  ${titleHtml}
                  <div style="margin-top:12px;color:#333;font-size:14px;line-height:1.5;">
                    ${bodyHtml}
                  </div>
                </td>
              </tr>

              <tr style="background:#017bbe;color:#ffffff">
                <td style="padding:14px 20px;font-size:12px;color:#f6fbff;">
                  ${footerHtml}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
};

const getEmailTemplate = (type, data = {}) => {
    switch (type) {
        case EmailTemplateType.WELCOME: {
            const fullname = `${escapeHtml(data.first_name || '')} ${escapeHtml(data.last_name || '')}`.trim() || 'Khách hàng';
            const subject = 'Chào mừng đến với OriBuyin';
            const titleHtml = `<h2 style="margin:0;color:#017bbe;font-size:18px;">Chào mừng ${fullname}!</h2>`;
            const bodyHtml = `
                <p style="margin:0 0 8px 0;">Cảm ơn bạn đã đăng ký tài khoản tại OriBuyin.</p>
                <p style="margin:0 0 8px 0;">Tên đăng nhập: <strong>${escapeHtml(data.user_name || '')}</strong></p>
                <p style="margin:0;color:#666;font-size:13px;">Bạn có thể đăng nhập và bắt đầu mua sắm ngay.</p>
            `;
            const footerHtml = `Nếu bạn không yêu cầu tạo tài khoản, vui lòng bỏ qua email này. &nbsp;•&nbsp; © OriBuyin`;
            const html = wrapCard(titleHtml, bodyHtml, footerHtml);
            const text = `Chào mừng ${fullname} đến với OriBuyin!\n\nTên đăng nhập: ${data.user_name || ''}\n\nNếu bạn không yêu cầu tạo tài khoản, vui lòng bỏ qua email này.\n\nOriBuyin`;
            return { subject, html, text };
        }

        case EmailTemplateType.RESET_PASSWORD: {
            const subject = 'Yêu cầu cập nhật mật khẩu - OriBuyin';
            const titleHtml = `<h2 style="margin:0;color:#017bbe;font-size:18px;">Yêu cầu đặt lại mật khẩu</h2>`;
            const codeHtml = data.code ? `<p style="margin:8px 0;"><strong>Mã:</strong> <span style="font-size:16px;background:#f1f5f8;padding:6px 10px;border-radius:4px;">${escapeHtml(data.code)}</span></p>` : '';
            const linkHtml = data.reset_link ? `<p style="margin:8px 0;">Hoặc nhấp vào: <a href="${escapeHtml(data.reset_link)}" style="color:#017bbe;text-decoration:none;">Đặt lại mật khẩu</a></p>` : '';
            const bodyHtml = `
                <p style="margin:0 0 8px 0;">Xin chào ${escapeHtml(data.first_name || '')},</p>
                <p style="margin:0 0 8px 0;color:#666;font-size:13px;">Bạn hoặc ai đó đã yêu cầu đặt lại mật khẩu. Sử dụng mã hoặc liên kết dưới đây để tiến hành.</p>
                ${codeHtml}
                ${linkHtml}
                <p style="margin:12px 0 0 0;color:#666;font-size:13px;">Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
            `;
            const footerHtml = `Yêu cầu cập nhật mật khẩu &nbsp;•&nbsp; OriBuyin`;
            const html = wrapCard(titleHtml, bodyHtml, footerHtml);
            const text = `Yêu cầu đặt lại mật khẩu\n\nMã: ${data.code || ''}\n\nLink: ${data.reset_link || ''}\n\nNếu bạn không yêu cầu, bỏ qua email này.\n\nOriBuyin`;
            return { subject, html, text };
        }

        case EmailTemplateType.ORDER_SUCCESS: {
            const subject = `Đơn hàng #${escapeHtml(String(data.order_id || ''))} - OriBuyin`;
            const titleHtml = `<h2 style="margin:0;color:#017bbe;font-size:18px;">Đơn hàng đã được tiếp nhận</h2>`;
            const bodyHtml = `
                <p style="margin:0 0 8px 0;">Xin chào ${escapeHtml(data.first_name || '')},</p>
                <p style="margin:0 0 8px 0;color:#666;font-size:13px;">Cảm ơn bạn đã đặt hàng. Thông tin đơn hàng:</p>
                <ul style="padding-left:18px;margin:8px 0;color:#333;font-size:14px;">
                  <li><strong>Mã đơn hàng:</strong> ${escapeHtml(String(data.order_id || ''))}</li>
                  <li><strong>Tổng tiền:</strong> ${escapeHtml(String(data.total_amount || '0'))} VND</li>
                  <li><strong>Trạng thái:</strong> ${escapeHtml(data.status || 'pending')}</li>
                </ul>
                <p style="margin:10px 0 0 0;color:#666;font-size:13px;">Chúng tôi sẽ cập nhật khi đơn hàng được xử lý.</p>
            `;
            const footerHtml = `Cảm ơn bạn đã mua sắm tại OriBuyin &nbsp;•&nbsp; © OriBuyin`;
            const html = wrapCard(titleHtml, bodyHtml, footerHtml);
            const text = `Đơn hàng #${data.order_id}\nTổng: ${data.total_amount} VND\nTrạng thái: ${data.status}\n\nCảm ơn bạn đã mua sắm tại OriBuyin.`;
            return { subject, html, text };
        }

        default:
            return { subject: data.subject || '', html: data.html || '', text: data.text || '' };
    }
};

module.exports = { getEmailTemplate };