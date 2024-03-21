const Sequelize=require('sequelize');

const sequelize=new Sequelize('node-complete', 'root', 'drTopper@1994',{
  dialect:'mysql',
  host:'localhost'
});

module.exports=sequelize;