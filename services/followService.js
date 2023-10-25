const Follow = require("../models/follow")

const followUsersId = async (identityUserId) => {
    
    try {
        
        let following = await Follow.find({ user: identityUserId }).select({ "_id": 0, "followed":1 }).exec()
    
        let followers = await Follow.find({ followed: identityUserId }).select({ "_id": 0, "followed":1 }).exec()
    
        let followingClean = []
    
         following.forEach(follow => {
            followingClean.push(follow.followed)
        });
        let followersClean = []
    
          followers.forEach(follow => {
            followersClean.push(follow.followed)
        });
        return {
            followingClean,
            followersClean
        }
    } catch (error) {
        return error
    }

}

const followThisUser =async (identityUserId, profileUserId) => {
    console.log(identityUserId, "identityUserId")
    console.log(profileUserId, "profileUserId")
    let following = await Follow.find({ user: identityUserId,followed:profileUserId }).select({ "_id": 0, "followed":1 }).exec()
    
    let followers = await Follow.find({ followed: identityUserId,user:profileUserId }).select({ "_id": 0, "followed":1 }).exec()

    return {
        following,
        followers
    }

}

module.exports = {
    followUsersId,
    followThisUser
}