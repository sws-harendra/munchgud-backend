// "use strict";

// module.exports = (sequelize, DataTypes) => {
//   const InstagramPost = sequelize.define("InstagramPost", {
//     url: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     isActive: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: true,
//     },
//   });

//   return InstagramPost;
// };





"use strict";

module.exports = (sequelize, DataTypes) => {
  const InstagramPost = sequelize.define(
    "InstagramPost",
    {
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    }
  );

  return InstagramPost;
};






