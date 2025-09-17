import QRCode from 'qrcode';

export async function generateQrCode(text: string): Promise<string> {
  return await QRCode.toDataURL(text, { margin: 1, width: 256 });
}
