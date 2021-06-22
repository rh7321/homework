function perToarr(num1){
    const per_no_length = num1.length;
    if(per_no_length == 13 && !isNaN(per_no) ){
        for(let i = 0; i < per_no_length; i++){
            per_arr[i] = per_no.substr(i,1);
        }
        return per_arr;
    }else{
        return "faild";
    }
}


function check_per_no(per_arr){
    let per_arr_result = 0;
    for(let x in per_arr){
        let i = Number(x)+2;
         if(i>9){
           i = i-8;
         }
         per_arr_result += (i * Number(per_arr[x]));
         //    console.log(`i값은 : ${i}, x값은 : ${x}, per_arr[${x}] : ${per_arr[x]},(i * Number(per_arr[x])) : ${(i * Number(per_arr[x]))},결과값 : ${per_arr_result}`);
       }

     per_arr_result = per_arr_result%11;

     //  console.log(per_arr_result);

     per_arr_result = 11-per_arr_result

     //  console.log(per_arr_result);

     if(per_arr_result > 9){
       per_arr_result =  per_arr_result%10
     }

     return per_arr_result;
}