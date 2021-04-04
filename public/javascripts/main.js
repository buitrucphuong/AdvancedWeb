$(document).ready(function(){
    var limit = 10;
    var limit_cm = 5;
    var start = 0;
    var time = new Date();
    var action = 'inactive';
    var action_cm = 'inactive'
    var urlParams = new URLSearchParams(window.location.search);

    //load and scroll=======================================
    
    if(urlParams.get('id')){
        if(action == 'inactive') {
            action = 'active';
            load_post_data_personal(limit, start, time, urlParams.get('id'))
        }
    }else {
        if(action == 'inactive') {
            action = 'active';
            load_post_data(limit, start, time);
        }
    }
    
    $(window).scroll(function(){
        if($(window).scrollTop() + $(window).height() > $("#load_data").height() && action == 'inactive'){
            action = 'active';
            start = start + limit;
            setTimeout(function(){
                if(urlParams.get('id')){
                    load_post_data_personal(limit, start, time, urlParams.get('id'))
                }else {
                    load_post_data(limit, start, time);
                } 
            }, 1000);
        }
    })

    // load post data personal=============================================    
    function load_post_data_personal(limit, start, time, id){
        $.ajax({
            type: 'GET',
            url: '/load_data_personal',
            data: {limit: limit, start: start, time: time, id: id},
            cache: false,
            success: function(pt) {
                load_post(pt)
            }
        }); 
    }

    //load post data=============================================    
    function load_post_data(limit, start, time){
        $.ajax({
            type: 'GET',
            url: '/load_data',
            data: {limit: limit, start: start, time: time},
            cache: false,
            success: function(pt) {
                load_post(pt)
            }
        }); 
    }

    //function load post
    function load_post(pt) {
        var html = '';
                pt.posts.forEach(function(data){
                    html += `<div class="card" id="post-content${data._id}">
                                <div class="card__body">
                                    <a href="/personal?id=${data.iduser._id}">
                                        <img  class="mr-2" src="${data.iduser.pic}" width="40" height="40">
                                        <span class="card__username">${data.iduser.name}</span>
                                    </a> °
                                    <span class="card__time-up">${new Date(data.created).toLocaleString('en-JM')}</span>
                                    ${checkuser(data.iduser._id, pt.user._id, data._id)}
                                    <br>
                                    <div>
                                        <p class="card__content-up">${data.content}</p>
                                        ${check_image(data)}
                                        ${check_video(data)}
                                        <p class="card__comments">0 Bình luận</p>
                                    </div><hr>
                                    <div class="card__bottom-up">
                                        <a href="#comment" class="${data._id}"><i class="fa fa-comments"></i> Bình luận</a>&emsp;
                                        
                                    </div>
                                    <div id="${data._id}">
                                    </div>
                                </div>
                            </div>`;
                            // <a href=""><i class="fa fa-share"></i> Chia sẻ</a>
                
                    //Input comment ===================================
                    input_comment(data, pt.user)
                    //Readmore comments======================================================
                    var begin = 0
                    $(document).on('click', '#readmore' + data._id, function(){
                        action_cm = 'active';
                        begin = begin + limit_cm
                        load_comment(limit_cm, begin, data._id, time)
                    });
                    //Delete post==========================================
                    delete_post(data._id)  
                    
                })
                $('#load_data').append(html);
                $('[data-toggle="popover"]').popover({html:true}); 
                if(pt.posts =='') {
                    $('#load_data_message').html("");
                    action = 'active';
                }else {
                    $('#load_data_message').html("<div class='spinner-border text-warning' ></div>");
                    action = 'inactive';
                }
    }

    //new post======================================================================
    $("#form-post").submit(function(e){
        e.preventDefault();
        var link = /^.*(youtu.be\/|v\/|embed\/|watch\?|youtube.com\/user\/[^#]*#([^\/]*?\/)*)\??v?=?([^#\&\?]*).*/
        var video = $("#post-video").val();
        var idVideo = video.match(link)

        var formData = new FormData()
        formData.append('content', $('#post-content').val().replace(/\r?\n/g, '<br/>')) 
        formData.append('image', $('#customFile')[0].files[0])
        if(idVideo) {
            formData.append('video', idVideo[3])
        }
        
        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: "/post",
            data: formData,
            processData: false,
            contentType: false,
            cache: false,
            success: function(data){
                var html = ``;
                html += `<div class="card" id="post-content${data.content._id}">
                            <div class="card__body">
                                <a href="/personal?id=${data.user._id}">
                                    <img  class="mr-2" src="${data.user.pic}" width="40" height="40">
                                    <span class="card__username">${data.user.name}</span>
                                </a> °
                                <span class="card__time-up">${new Date(data.content.created).toLocaleString('en-JM')}</span>
                                ${checkuser(data.user._id, data.user._id, data.content._id)}
                                <br>
                                <div>
                                    <p class="card__content-up">${data.content.content}</p>
                                    ${check_image(data.content)}
                                    ${check_video(data.content)}
                                    <p class="card__comments">0 Bình luận</p>
                                </div><hr>
                                <div class="card__bottom-up">
                                    <a href="#comment" class="${data.content._id}"><i class="fa fa-comments"></i> Bình luận</a>&emsp;
                                </div>
                                <div id="${data.content._id}">
                                </div>
                            </div>
                        </div>`;
                $('#new-post').append(html);   
                
                //Input comment=============================
                input_comment(data.content, data.user)

                $('[data-toggle="popover"]').popover({html:true}); 
                //Delete post==========================================
                delete_post(data.content._id) 
                //==================================
                $('#exampleModal').modal('hide');
                $('#form-post').find('textarea').val('');
                $('#customFile').val('');
                $('#customFile').siblings(".custom-file-label").addClass("selected").html('Chọn ảnh');
                $('#post-video').val('');
            }
        })
    })

    //Funtion Input comment============================================
    function input_comment(data, user) {
        $(document).one('click', '.' + data._id, function(){
            var inputComment = `<hr><div class="comment">
                                    <a href="/personal?id=${user._id}">
                                        <img  class="mr-2" src="${user.pic}" width="35" height="35">
                                    </a>
                                    <form id="form-comment${data._id}">
                                        <div class="row">
                                            <div class="col-9">
                                                <input type="text" class="form-control thinking" id="commenContent${data._id}" name="content" placeholder="Viết bình luận..." required>
                                            </div>
                                            <div class="col-3">
                                                <button type="submit" class="btn btn-primary">Gửi</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div id="ipcm${data._id}"></div>
                                <div id="cm${data._id}"></div>
                                <a href="#readmore" id="readmore${data._id}"></a>
                                `
            $( '#' + data._id).append(inputComment);
            //Add new comment ============================================
            add_comment(data._id)
            //Load comment =============================================
            var begin = 0
            load_comment(limit_cm, begin, data._id, time)
        });
    }
    //Function check option user ============================================================
    function checkuser(idpostuser, idcurrentuser, id) {
        var option = ''
        if(idpostuser == idcurrentuser) {
            option += `<span tabindex="-1" class="d-inline-block" data-trigger="focus" data-toggle="popover" data-content="<a href='#delete' id='delete${id}'>Xóa</a>">
                            <button class="btn"  style="pointer-events: none;" type="button" disabled><i class="fas fa-ellipsis-h"></i></button>
                        </span>`
        }
        return option
    }
    //Function check image=========================================================
    function check_image(data) {
        var img = ''
        if(data.image) {
            img += `<img class="image-up" src="upload/${data.image}" width="100%" ><br><br>`
        }
        return img
    }

    function check_video(data) {
        var video = ''
        if(data.video) {
            video += `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${data.video}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        }
        return video
    }
    //Function Load comments function=================================
    function load_comment(limit, start, id, time){
        $.ajax({
            type: 'GET',
            url: '/load_comment',
            data: {limit: limit, start: start, id: id, time: time},
            cache: false,
            success: function(cm) {
                var html = ``;
                cm.comment.forEach(function(data){
                    html += `<div class="comment-content" id="comment-content${data._id}">
                            <a href="/personal?id=${data.iduser._id}">
                                <img  class="mr-2" src="${data.iduser.pic}" width="35" height="35">
                            </a>
                            <div class="comment-content-text"> 
                                <a href="/personal">
                                    <span class="card__username">${data.iduser.name}</span>
                                </a> °
                                <span class="card__time-up">${new Date(data.created).toLocaleString('en-JM')}</span>
                                ${checkuser(data.iduser._id, cm.user._id, data._id)}
                                <p>${data.content}</p>
                            </div>
                        </div>`
                    //delete comment ======================
                    delete_comment(data._id)   
                    
                })
                $('#cm' + id).append(html);
                
                $('[data-toggle="popover"]').popover({html:true}); 
                
                //===========================
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

    //Function add new comment
    function add_comment(id) {
        $('#form-comment' + id).submit(function(e){
            e.preventDefault();
            var content = $("#commenContent" + id).val();
            $.ajax({
                url: "/post-comment",
                data: {
                    content: content,
                    idpost: id
                },
                method: "POST",
                success: function(data){ 
                    var newcomment = `<div class="comment-content" id="comment-content${data.content._id}">
                                        <a href="/personal?id=${data.user._id}">
                                            <img  class="mr-2" src="${data.user.pic}" width="35" height="35">
                                        </a>
                                        <div class="comment-content-text"> 
                                            <a href="/personal">
                                                <span class="card__username">${data.user.name}</span>
                                            </a> °
                                            <span class="card__time-up">${new Date(data.content.created).toLocaleString('en-JM')}</span>
                                            <span tabindex="-1" class="d-inline-block" data-trigger="focus" data-toggle="popover" data-content="<a href='#delete' id='delete${data.content._id}'>Xóa</a>">
                                                <button class="btn"  style="pointer-events: none;" type="button" disabled><i class="fas fa-ellipsis-h"></i></button>
                                            </span>
                                            <p>${data.content.content}</p>
                                        </div>
                                    </div>`
                    //delete comment ======================
                    delete_comment(data.content._id)  
                    //====================================
                    $( '#ipcm' + id).append(newcomment);
                    $('#form-comment' + id).find('#commenContent' + id).val('');
                    $('[data-toggle="popover"]').popover({html:true}); 
                }
            })
        })
    }

    //Function Delete comment ==========================================
    function delete_comment(id) {
        $(document).on('click', '#delete' + id, function(){
            $.ajax({
                url: "/delete_comment",
                method: "POST",
                data: {
                    id: id
                },
                success: function(){ 
                    $('#comment-content' + id).remove();
                }
            })
        });
    }
    //Function delete post ==========================================
    function delete_post(id) {
        $(document).on('click', '#delete' + id, function(){
            $.ajax({
                url: "/delete_post",
                method: "POST",
                data: {
                    id: id
                },
                success: function(){ 
                    $('#post-content' + id).remove();
                }
            })
        });
    }

    //Upload file====================================================
    $(".custom-file-input").on("change", function() {
        var fileName = $(this).val().split("\\").pop();
        $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
    });
});


