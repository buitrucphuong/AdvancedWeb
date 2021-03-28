//==Load Data===============================

$(document).ready(function(){
    var limit = 10;
    var start = 0;
    var time = new Date();
    var action = 'inactive';
    var action_cm = 'inactive'
    function load_post_data(limit, start, time){
        $.ajax({
            type: 'GET',
            url: '/load_data',
            data: {limit: limit, start: start, time: time},
            cache: false,
            success: function(pt) {
                var html = '';
                pt.posts.forEach(function(data){
                    html += `<div class="card">
                                <div class="card__body">
                                    <a href="/personal/${data.iduser._id}">
                                        <img  class="mr-2" src="${data.iduser.pic}" width="40" height="40">
                                        <span class="card__username">${data.iduser.name}</span>
                                    </a> °
                                    <span class="card__time-up">${new Date(data.created).toLocaleString('en-JM')}</span><br>
                                    <div>
                                        <p class="card__content-up">${data.content}</p>
                                        <p class="card__comments">0 Bình luận</p>
                                    </div><hr>
                                    <div class="card__bottom-up">
                                        <a href="#comment" class="${data._id}"><i class="fa fa-comments"></i> Bình luận</a>&emsp;
                                        <a href=""><i class="fa fa-share"></i> Chia sẻ</a>
                                    </div>
                                    <div id="${data._id}">
                                    </div>
                                </div>
                            </div>`;
                    //==Comments=========================================================
                    $(document).one('click', '.' + data._id, function(){
                        var inputComment = `<hr><div class="comment">
                                                <a href="/personal">
                                                    <img  class="mr-2" src="${pt.user.pic}" width="35" height="35">
                                                </a>
                                                    <input type="text" class="form-control thinking" id="usr" placeholder="Viết bình luận...">
                                                    &ensp;<input type="submit" class="btn btn-primary btn-send" value="Gửi">
                                            </div>
                                            <div id="cm${data._id}"></div>
                                            <a href="#readmore" id="readmore${data._id}"></a>
                                            `
                        $( '#' + data._id).append(inputComment);
                        load_comment(limit, start, data._id)
                        
                    });
                    var begin = 0
                    $(document).on('click', '#readmore' + data._id, function(){
                        action_cm = 'active';
                        begin = begin + limit
                        load_comment(limit, begin, data._id)
                    });
                })
                $('#load_data').append(html);
            
                if(pt.posts =='') {
                    $('#load_data_message').html("");
                    action = 'active';
                }else {
                    $('#load_data_message').html("<div class='spinner-border text-warning' ></div>");
                    action = 'inactive';
                }
            }
        }); 
    }

    function load_comment(limit, start, id){
        $.ajax({
            type: 'GET',
            url: '/load_comment',
            data: {limit: limit, start: start, id: id},
            cache: false,
            success: function(cm) {
                var html = ``;
                cm.comment.forEach(function(data){
                    html += `<div class="comment-content">
                            <a href="/personal">
                                <img  class="mr-2" src="${data.iduser.pic}" width="35" height="35">
                            </a>
                            <div class="comment-content-text"> 
                                <a href="/personal">
                                    <span class="card__username">${data.iduser.name}</span>
                                </a> °
                                <span class="card__time-up">1 giờ</span>
                                <span class="d-inline-block" data-toggle="popover" data-content="<a href=''>Xóa bình luận này</a>">
                                    <button class="btn" style="pointer-events: none;" type="button" disabled><i class="fas fa-ellipsis-h"></i></button>
                                </span>
                                <p>${data.content}</p>
                            </div>
                        </div>`
                })
                $('#cm' + id).append(html);
                if(cm.comment =='') {
                    $('#readmore' + id).html("");
                    action_cm = 'active';
                }else {
                    $('#readmore' + id).html("Xem thêm bình luận");
                    action_cm = 'inactive';
                }
            }
        }); 
    }
    if(action == 'inactive') {
        action = 'active';
        load_post_data(limit, start, time);
    }
    $(window).scroll(function(){
        if($(window).scrollTop() + $(window).height() > $("#load_data").height() && action == 'inactive'){
            action = 'active';
            start = start + limit;
            setTimeout(function(){
                load_post_data(limit, start, time);
            }, 1000);
        }
    })

    //Đăng bài viết mới
    $("#form-post").submit(function(e){
        e.preventDefault();
        var content = $("#post-content").val();
        var filename = $("#customFile").val();
        $.ajax({
            url: "/post",
            data: {
                content: content,
                filename: filename
            },
            method: "POST",
            success: function(data){
                var html = ``;
                html += `<div class="card">
                            <div class="card__body">
                                <a href="/personal">
                                    <img  class="mr-2" src="${data.user.pic}" width="40" height="40">
                                    <span class="card__username">${data.user.name}</span>
                                </a> °
                                <span class="card__time-up">${new Date(data.content.created).toLocaleString('en-JM')}</span><br>
                                <div>
                                    <p class="card__content-up">${data.content.content}</p>
                                    <p class="card__comments">0 Bình luận</p>
                                </div><hr>
                                <div class="card__bottom-up">
                                    <a href="#comment" class="${data.content._id}"><i class="fa fa-comments"></i> Bình luận</a>&emsp;
                                    <a href=""><i class="fa fa-share"></i> Chia sẻ</a>
                                </div>
                                <div id="${data.content._id}">
                                </div>
                            </div>
                        </div>`;
                $('#new-post').append(html);   
                $(document).one('click', '.' + data.content._id, function(){
                    var inputComment = `<hr><div class="comment">
                                            <a href="/personal">
                                                <img  class="mr-2" src="${data.user.pic}" width="35" height="35">
                                            </a>
                                            <input type="text" class="form-control thinking" id="usr" placeholder="Viết bình luận...">
                                            &ensp;<input type="submit" class="btn btn-primary btn-send" value="Gửi">
                                        </div>
                                        `
                    $( '#' + data.content._id).append(inputComment);
                });       
                $('#exampleModal').modal('hide');
                $('#form-post').find('textarea').val('');
            }
        })
    })

});

$(".custom-file-input").on("change", function() {
    var fileName = $(this).val().split("\\").pop();
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
});
