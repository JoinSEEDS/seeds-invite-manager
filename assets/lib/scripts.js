function initloginPage(info){
    var shouldcContinue = true;
    function checkServer(){

        setTimeout(function(){
            $.get('/checkQr/'+info.id)
            .done(function(data) {
                if (data=="ok") {
                    //window.location.href="/auth/"+info.id
                    alert("authenticated!");
                    shouldcContinue = false;
                }
                if (data=="refresh") {
                    window.location.reload();
                }
            })
            .always(function() {
                if (shouldcContinue) { checkServer();}
            });
            
        },1000);
    }
    checkServer();

}