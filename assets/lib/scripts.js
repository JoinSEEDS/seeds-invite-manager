function initloginPage(info){

    setInterval(function(){
        $.get('/checkQr/'+info.id)
            .done(function(data) {
                if (data=="ok") {
                    window.location.href="/auth/"+info.id
                }
                if (data=="refresh") {
                    window.location.reload();
                }
            });

    },1000);

}