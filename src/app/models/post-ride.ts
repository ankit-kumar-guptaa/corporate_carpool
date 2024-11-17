

export class PostRide {
  
        UserId: string ;
        UserName: string ;
        userType: string;
        From_Address: string ;
        To_Address: string ;
        Form_Latitude: string ;
        Form_Longitude: string ;
        To_Latitude: string ;
        To_Longitude: string ;
        Ride_Type: string ;
        Ride_Date: string ;
        Ride_Frequency: string ;
        User_Comment: string ;
        Via: string[] = []
        IsSearch:number;
        constructor()
        constructor(_postRide: PostRide)
        constructor(_postRide?: any) {
          this.UserId = _postRide && _postRide.UserId || 0;
         
          this.UserName= _postRide && _postRide.UserId || '';
          this.userType= _postRide && _postRide.userType || 'Pooler';
          this.From_Address= _postRide && _postRide.From_Address || '';
          this.To_Address= _postRide && _postRide.To_Address ||'';
          this.Form_Latitude= _postRide && _postRide.Form_Latitude ||'';
          this.Form_Longitude= _postRide && _postRide.Form_Longitude ||'';
          this.To_Latitude= _postRide && _postRide.To_Latitude || '';
          this.To_Longitude= _postRide && _postRide.To_Longitude || '';
          this.Ride_Type= _postRide && _postRide.Ride_Type || 'One Way';
          this.Ride_Date= _postRide && _postRide.Ride_Date || '';
          this.Ride_Frequency= _postRide && _postRide.Ride_Frequency || 'None';
          this.User_Comment= _postRide && _postRide.User_Comment || 'I am looking for carpool';
          this.Via= _postRide && _postRide.Via || [];
          this.IsSearch= _postRide && _postRide.IsSearch || 0;

        }
   
}
