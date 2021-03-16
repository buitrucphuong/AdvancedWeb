//==Load Data===============================

$(document).ready(function(){
    var limit = 4;
    var start = 0;
    var action = 'inactive';
    function load_post_data(limit, start){
        $.ajax({
            type: 'GET',
            url: '/load_data',
            data: {limit: limit, start: start},
            cache: false,
            success: function(pt) {
                var html = '';
                
                pt.forEach(function(data){
                    html += `<div class="card">
                                <div class="card__body">
                                    <a href="/personal">
                                        <img  class="mr-2" src="images/` + data.iduserinfo.avatar +`" width="40" height="40">
                                        <span class="card__username">`+ data.iduserinfo.name +`</span>
                                    </a> °
                                    <span class="card__time-up">1 giờ</span><br>
                                    <div>
                                        <p class="card__content-up">
                                            ` + data.content +`
                                        </p>
                                        <p class="card__comments">0 Bình luận</p>
                                    </div><hr>
                                    <div class="card__bottom-up">
                                        <a href="#"><i class="fa fa-comments"></i> Bình luận</a>&emsp;
                                        <a href=""><i class="fa fa-share"></i> Chia sẻ</a>
                                    </div>
                                    <div id="comment">
                                    </div>
                                
                                </div>
                            </div>`;
                })
                console.log(pt);
                $('#load_data').append(html);
            
                if(pt =='') {
                    $('#load_data_message').html("<button type='button' class='btn btn-info'>Bạn đã xem hết </button>");
                    action = 'active';
                }else {
                    $('#load_data_message').html("<div class='spinner-border text-warning' ></div>");
                    action = 'inactive';
                }
            }
        }); 
    }
    if(action == 'inactive') {
        action = 'active';
        load_post_data(limit, start);
    }
    $(window).scroll(function(){
        if($(window).scrollTop() + $(window).height() > $("#load_data").height() && action == 'inactive'){
            action = 'active';
            start = start + limit;
            setTimeout(function(){
                load_post_data(limit, start);
            }, 1000);
        }
    })

    
    
    //==Comments=========================================================
    
});


$(document).ready(function(){
    $(".card").click(function(){
        alert("You've clicked the link.");
    });
});