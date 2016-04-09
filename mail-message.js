const MailMessage = {
  getMessageBuffers: (to, sender, subject, message, attachments) => {
    const boundary = '----sinikael-?=_1-14599299345280.05979742878116667';
    const hasAttachments = !!attachments && attachments.length > 0;
    const buffers = [];
    if (hasAttachments) {
      buffers.push(new Buffer(`Content-Type: multipart/mixed; boundary=\"${boundary}\"\n`));
    } else {
      buffers.push(new Buffer('Content-Type: text/html; charset=utf-8\n'));
      buffers.push(new Buffer('Content-Transfer-Encoding: quoted-printable\n'));
    }
    buffers.push(new Buffer(`to: ${to}\n`));
    buffers.push(new Buffer(`from: ${sender}\n`));
    buffers.push(new Buffer(`subject: ${subject}\n\n`));
    if (hasAttachments) {
      buffers.push(new Buffer(`--${boundary}\n`));
      buffers.push(new Buffer('Content-Type: text/html; charset=utf-8\n'));
      buffers.push(new Buffer('Content-Transfer-Encoding: quoted-printable\n\n'));
    }
    buffers.push(new Buffer(`${message}`));
    if (hasAttachments) {
      attachments.forEach(a => {
        buffers.push(new Buffer(`\n--${boundary}\n`));
        buffers.push(new Buffer(`Content-Type: ${a.contentType}; name=${a.filename}\n`));
        buffers.push(new Buffer(`Content-Disposition: attachment; filename=${a.filename}\n`));
        buffers.push(new Buffer('Content-Transfer-Encoding: base64\n\n'));
        buffers.push(new Buffer(a.bytes, a.encoding));
      });
      buffers.push(new Buffer(`\n--${boundary}`));
    }
    return buffers;
  },

  getEncodedMessage: (to, sender, subject, message, attachments) => {
    const buffers = MailMessage.getMessageBuffers(
      to, sender, subject, message, attachments);
    return Buffer.concat(buffers).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  },
};

module.exports = MailMessage;
