const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgmail = require('@sendgrid/mail');
const ORDERDB = functions.config().database.orderdb;
admin.initializeApp();
const API_KEY = functions.config().sendgrid.key;
const TEMPLATE_ID = functions.config().sendgrid.templateordercancelledbypartner;
sgmail.setApiKey(API_KEY);
const runTimeOpts = {
    timeoutSeconds: 300,
    memory: '1GB'
}
exports.sendOrderCancelledByPartnerEmail = 
functions
        .runWith(runTimeOpts)
        .database.instance(ORDERDB).ref('/Orders/{orderId}')
        .onWrite(async (change, context) =>{
            const snapshot = change.after;
            const order = snapshot.val();
            //orderId, restaurantName,orderDate,orderType
            //,transactionId,paymentMode,totalAmount,items
            const orderId = context.params.orderId;
            const restaurantName = order.restaurantName.toLowerCase();
            const orderDate = order.transactionTime;
            const isPickup = order.pickup;
            const itemTotal = order.onlyFoodPrice;
            const packingCharges = order.packingCharges;
            const deliveryCharges = order.deliveryCharges;
            var orderType = "";
            if(isPickup == true)
                orderType = "Pickup"
            else
                orderType = "Delivery"
            const transactionId = order.transactionId;    
            const paymentMode = order.paymentMode;
            const totalAmount = order.totalPayment;
            const itemList = order.cartItemList;
            const userName  = order.userName;
            const userEmail = order.userEmail;
            const currentStatus = order.orderStatus;


            //Logging
            console.log('orderId',orderId);
            console.log('restaurantName',restaurantName);
            console.log('orderDate',orderDate);
            console.log('orderType',orderType);
            console.log('transactionId',transactionId);
            console.log('paymentMode',paymentMode);
            console.log('totalAmount',totalAmount);
            console.log('items',itemList);
            console.log('userName',userName);
            console.log('userEmail',userEmail);
            console.log('currentStatus',currentStatus);
            console.log('Item Total',itemTotal);
            console.log('packingCharges',packingCharges);
            console.log('deliveryCharges',deliveryCharges);

            if(currentStatus == -1){
                const msg = {
                    to:{
                        email:userEmail,
                        name:userName
                    },
                    from:{
                        email: 'orderupdate@mails.oncampus.in',
                        name: 'onCampus.in'
    
                    },
                    reply_to:{
                        email:'contact@oncampus.in',
                        name:'onCampus.in'
                    },
                    click_tracking:{
                        enable:true,
                        enable_text:true
        
                    },
                    open_tracking:{
                        enable:true
        
                    },
                    templateId: TEMPLATE_ID,
                    dynamic_template_data:{
                        userName:userName,
                        orderId:orderId,
                        restaurantName:restaurantName,
                        orderDate:orderDate,
                        orderType:orderType,
                        transactionId:transactionId,
                        paymentMode:paymentMode,
                        itemTotal:itemTotal,
                        packingCharges:packingCharges,
                        deliveryCharges:deliveryCharges,
                        totalAmount:totalAmount,
                        items:itemList,
                    },

                };
                return await sgmail.send(msg)
                    .then(() =>{
                        console.log("Email sent successfully");
                    }).catch((error) =>{
                        console.log('Email sending error: ',error);
                    })

            }
            else
                return null;




        });