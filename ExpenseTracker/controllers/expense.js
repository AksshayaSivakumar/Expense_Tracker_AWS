const path=require('path');
const sequelize = require("../util/database");
const Expense=require('../models/expense');
const User=require('../models/user');
const rootDir=require('../util/path');
const bcrypt=require('bcrypt');


exports.Index=async(req, res) =>{
    res.sendFile(path.join(rootDir,'public','index.html'));
  }

  exports.submitExpense=async(req,res)=>{
    
    const t=await sequelize.transaction();

    try{
    const { expenseamount, description, category } = req.body;
    //console.log(expenseamount)
    if(expenseamount==undefined||expenseamount.length==0)
    {
      return res.status(400).json({success:false,message:"some parameters missing"})
    }
   
    const expense=await Expense.create({ expenseamount, description, category, userId:req.user.id},{transaction:t})
      const totalexpense=Number(req.user.totalexpense)+Number(expenseamount)
      console.log(totalexpense)
      await User.update({totalexpense:totalexpense
      },{
        where:{id:req.user.id},
         transaction:t
        })
  
          await t.commit();
          res.status(201).json({success:true,expense:expense})
        
      }
    catch(err){
      await t.rollback();
      res.status(500).json({success:false,error:err})
    }
        
 }

        exports.getExpense=async(req,res)=>{
          console.log("hello")
         
          await Expense.findAll({where: {userId: req.user.id}}).then(expenses=>{
            //console.log(expenses)
            return res.status(200).json({success:true,expenses})
          })
          .catch(err=>{
            res.status(500).json({success:false,error:err})
          })
              
        }

        exports.deleteExpense=async(req,res)=>{
          const t=await sequelize.transaction();
          const expenseid = req.params.expenseid
          try{
            if(req.params.expenseid == 'undefined')
            {
         
                console.log('ID is Missing');
                return res.status(400).json({err:'Id is missing'})
            }
             const expense=await Expense.findByPk(expenseid);
             const expenseamount=expense.expenseamount;

            const noOfRows= await Expense.destroy({where:{id:expenseid,userId: req.user.id}})

             
              if(noOfRows==0)
              {
                return res.status(404).json({success:false,message:"expense doesnot belong to the user"})
              }

              const updatedtotalexpense=Number(req.user.totalexpense)-Number(expenseamount)
              await User.update({totalexpense:updatedtotalexpense
              },{
                where:{id:req.user.id},
                 transaction:t
                })
          
              await t.commit();
             
             return res.status(200).json({success:true,message:"expense deleted successfully"})
            }
           catch(err)  {
            await t.rollback();
            console.log(err);
            return res.status(500  ).json(err)
           }
        }

  


