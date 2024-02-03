interface ISmsController {
  msg: string;
  to: string;
  sendSms: () => Promise<void>;
  reboot: () => Promise<void>;
}
