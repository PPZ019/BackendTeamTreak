const TeamDto = require('./team-dto');
<<<<<<< Updated upstream
class UserDto{
=======

class UserDto {
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    constructor(user)
    {
        this.id = user._id,
        this.name = user.name,
        this.username = user.username,
        this.email = user.email,
        this.mobile = user.mobile,
        this.image = user.image && `${process.env.BASE_URL}storage/images/profile/${user.image}`,
        this.type = user.type && user.type.charAt(0).toUpperCase() + user.type.slice(1),
        this.address = user.address,
        this.status = user.status && user.status.charAt(0).toUpperCase()+user.status.slice(1),
        this.team = user.team && new TeamDto(Array.isArray(user.team) && user.team.length>0 ? user.team[0] : user.team);
    }
=======
>>>>>>> Stashed changes

    constructor(user) {
        this.id = user._id;
        this.name = user.name;
        this.username = user.username;
        this.email = user.email;
        this.mobile = user.mobile;

        // ✅ FIXED: Handle Cloudinary or local image
        if (user.image?.startsWith('http')) {
            this.image = user.image;
        } else if (user.image) {
            this.image = `${process.env.BASE_URL}storage/images/profile/${encodeURIComponent(user.image)}`;
        } else {
            this.image = null;
        }

        this.type = user.type && user.type.charAt(0).toUpperCase() + user.type.slice(1);
        this.address = user.address;
        this.status = user.status && user.status.charAt(0).toUpperCase() + user.status.slice(1);
        this.team = user.team && new TeamDto(Array.isArray(user.team) && user.team.length > 0 ? user.team[0] : user.team);
    }
}

module.exports = UserDto;
