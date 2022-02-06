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


function initInviteView() {
    var $copyBtn = $("#copyBtn");
    $("#copyBtn, .copyBtn").on( "click", function(){
        var url = document.getElementById("linkUrl");
        
        navigator.clipboard.writeText(url.getAttribute("href"));

        $copyBtn.find('i').removeClass("fa-copy").addClass("fa-check");
        setTimeout(function(){
            $copyBtn.find('i').removeClass("fa-check").addClass("fa-copy");
        }, 500);
        return false;
    });
    
    $( document ).ready(function() {
        $('[data-bs-toggle="tooltip"]').tooltip()
    });

    $("#delete-event").on("click",function(event){
       if(!confirm(`Are you sure you want to delete this invite event '${$(this).data("inviteEventName")}'?`)){
        return false;
       } 
    });
}