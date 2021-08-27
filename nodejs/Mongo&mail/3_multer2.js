const express = require('express');
const bodyParser = require('body-parser');
const static = require('serve-static');
const multer = require('multer');
const path = require('path');
const logger = require('morgan');
const fs = require('fs');
const nodemailer = require('nodemailer');
const mongoClient = require('mongodb').MongoClient;


const port = 3000;
const app  = express();
const router = express.Router();

app.use(bodyParser.urlencoded({extended: false}));

let database; 

// 몽고디비 연결 함수
function connectDB(){
    const databaseURL = "mongodb://127.0.0.1:27017";
    mongoClient.connect(databaseURL, {useUnifiedTopology: true}, (err, success) => {
        if(err){
            console.log(err);
        }else{
            database = success.db('frontend');
            console.log('mongodb 데이터베이스 연결 성공!');
        }
    });
}



app.use('/public',static(path.join(__dirname,'public')));
app.use('/uploads',static(path.join(__dirname,'uploads')));
app.use(logger('dev'));


const storage = multer.diskStorage({
    destination : (req,file,callback)=>{
        callback(null,'uploads');
    },
    filename:(req,file,callback)=>{  //apple.jpg
        const extension = path.extname(file.originalname); //.jpg만 축출
        const basename = path.basename(file.originalname, extension); // apple 만 축출
        callback(null,basename + "_" + Date.now() + extension);
    }   
});

const upload = multer({
    storage : storage,
    limit : {
        files : 1, 
        fileSize : 1024 * 1024 * 100
    }
})
 



router.route('/mail').post(upload.array('photo',1),(req,res)=>{
    try{
        const files = req.files;
        console.dir(req.files[0]);
        let originalname = '';
        let filename = '';
        let mimetype = '';
        let size = 0;
        if(Array.isArray(files)){
            console.log(`클라이언트에서 받아온 파일 개수 : ${files.length}`);
            for(let i = 0; i< files.length; i++){
                originalname = files[i].originalname;
                filename = files[i].filename;
                mimetype = files[i].mimetype;
                size = files[i].size;
            } 
        }
        fs.readFile('uploads/'+filename,(err,data)=>{
            if(err){
                console.log(err);
            }else{
                const rec_email = req.body.rec_email;
                const rec_id = req.body.rec_id;
                const e_body = req.body.e_body;
                const e_title = req.body.e_title;
            
                const send_mail = '고인철<rh7321@naver.com>';
                const rec_mailID = `${rec_id}<${rec_email}>`;

                console.log(rec_mailID);

                const transporter = nodemailer.createTransport({
                    service : 'Naver',
                    auth : {
                        user : 'rh7321@naver.com',
                        pass : 'trasdkoic!@'
                    },
                    host : 'smtp.naver.com',
                    port : '587'
                });
                
                const mailOptions= {
                    from : rec_mailID,
                    to : send_mail,
                    subject : e_title,
                    text : e_body,
                    attachments : [{'filename':filename, 'content' : data}]
                };
                    console.log(mailOptions);
                transporter.sendMail(mailOptions, (err,info)=>{
                    if(err){
                        console.log(err);
                    }else{
                      
                     
                        // 3_multer2.js 예제의 메일 데이터를 mongodb에 저장 (받는 사람, 받는사람이메일, 제목, 내용, 파일이름, 날짜 시간)
                        const dateNow =  Date.now();
                        if(database){
                            joinMember(database,rec_id, rec_email,send_mail,e_title,e_body,filename, dateNow,(err,result)=>{
                                if(err){
                                    console.log(err);
                                }else{
                                    console.log(result);
                                    
                                   
                                
                                    console.log(info);
                                    res.writeHead('200',{'content-type':'text/html;charset=utf8'});
                                    res.write('<h2>메일 전송 성공</h2>');
                                    res.write('<hr/>');
                                    res.write(`<p>제목 : ${e_title}</p>`);
                                    res.write(`<p>원본파일명 : ${e_body}</p>`);
                                    res.write(`<p>현재파일명 : ${filename}</p>`);
                                    res.write(`<p><img src='/uploads/${filename}' width=200</p>`);
                                    res.write('<p>몽고 디비 저장 완료!!</p>');
                                    res.end();
                                }
                            });

                        }else{
                            res.writeHead('200',{'content-type':'text/html;charset=utf8'});
                            res.write('<p>데이터베이스 연결 실패</p>');
                            res.write('<p>mongodb 데이터베이스에 연결하지 못했습니다</p>');
                            res.end();
                        }
                      
                        
                       

                    }
                })
            }
        

        })
        

    }catch(e){
        console.log(e);
    }
})


const joinMember = function(database,rec_id, rec_email,send_mail,e_title,e_body,filename, dateNow, callback){
    const members = database.collection('email');
    members.insertMany([{rec_id:rec_id, rec_email:rec_email, send_mail:send_mail, e_title:e_title,e_body:e_body,filename:filename,dateNow:dateNow}], (err, result) => {
        if(err){
            console.log(err);
            callback(err, null);
            return;
        }else{
            if(result.insertedCount > 0){
                console.log(`해당 이메일의 document가 추가 되었습니다. `);
                callback(null, result);
            }else{
                console.log(`해당 이메일의 document가 추가 되지 않았습니다.`);
                callback(err, null);
            }
           
        }
    });
}



app.use('/',router);

app.listen(port, () => {
    console.log(`${port}포트로 서버 동작중 ...`);
    connectDB();
});