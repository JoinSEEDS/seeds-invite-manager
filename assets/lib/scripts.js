function initloginPage(info){
    var shouldcContinue = true;
    function checkServer(){

        setTimeout(function(){
            $.get('/checkQr/'+info.id)
            .done(function(data) {
                if (data=="ok") {
                    //window.location.href="/auth/"+info.id
                    $.post('/auth', { id:info.id })
                    .done(function(response){
                        if(response.redirect){
                            window.location.href = response.redirect|'/';
                        } else {
                            window.location.href = '/';
                        }
                    });
                    //alert("authenticated!");
                    shouldcContinue = false;
                }
                if (data=="refresh") {
                    window.location.reload();
                }
            })
            .always(function() {
                if (shouldcContinue) { checkServer();}
            });
            
        }, 1000);
    }
    checkServer();

}