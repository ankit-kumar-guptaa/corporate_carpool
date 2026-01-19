export class UserModel {
  id: number;
  internal_code: string;
  name: string;
  email: string;
  mobile_No: string;
  Otp: string;
  Gender: string;
  Password: string;
  phoneOtp: string;
  VehicleType: string;

  constructor();
  constructor(ProfileListModel: UserModel);
  constructor(users?: any) {
    this.id = users && users.id || 0;
    this.internal_code = users && users.internal_code || '';
    this.name = users && users.name || '';
    this.email = users && users.email || '';
    this.mobile_No = users && users.mobile_No || '';
    this.Otp = users && users.Otp || '';
    this.Gender = users && users.Gender || '';
    this.Password = users && users.Password || '';
    this.phoneOtp = users && users.phoneOtp || '';
    this.VehicleType = users && users.VehicleType || '';
  }
}