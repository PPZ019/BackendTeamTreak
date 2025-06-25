const TeamDto = require('./team-dto');
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
class UserDto {
    id;
    name;
    email;
    username;
    mobile;
    image;
    type;
    address;
    status;
    team;
    company;
    
    constructor(user) {
        this._id = user._id;
        this.name = user.name || '';
        this.username = user.username || '';
        this.email = user.email || '';
        this.mobile = user.mobile || '';
        this.image = user.image
          ? `${process.env.BASE_URL}storage/images/profile/${encodeURIComponent(user.image)}`
          : null;
        this.type = user.type ? capitalize(user.type) : '';
        this.address = user.address || '';
        this.status = user.status ? capitalize(user.status) : '';
        
        this.team = user.team
          ? new TeamDto(Array.isArray(user.team) && user.team.length > 0 ? user.team[0] : user.team)
          : null;
    
          this.company = user.company
          ? {
              _id: user.company._id,
              name: user.company.name,
            }
          : null;
      }

}

module.exports = UserDto;