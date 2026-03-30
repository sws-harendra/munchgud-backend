"use strict";

module.exports = (sequelize, DataTypes) => {
    const SocialLinks = sequelize.define("SocialLinks", {
        instagram: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        facebook: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        twitter: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    return SocialLinks;
};