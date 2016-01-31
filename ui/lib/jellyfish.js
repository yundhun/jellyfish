 $(function() {
    // there's the toDoGround and the completeGround
    var $toDoGround = $( "#toDoGround" ),      
        $completeGround = $( "#completeGround" );    

    //수정상자 팝업 기능 부여.
    $( "#dialog" ).dialog({autoOpen: false, modal: true});

    //수정상자에서 '수정완료' 클릭시 이벤트.
    $( "#dialog" ).children('.modComplete').click(function(){
      var uuid = $( "#dialog" ).children('.uuid').val(); //uuid
      var receiver = $( "#dialog" ).children('.receiver').val(); //receiver ID
      var contents = $( "#dialog" ).children('.modContents').val(); //변경 내용
      if(receiver.length == 0){
        alert("받는 사람을 입력해 주세요.");
      }else{
        postUpdate(uuid, userName,receiver,contents,"DNA", "DNA");        
      }      
    });

    //수정상자에서 '삭제' 클릭시 이벤트.
    $( "#dialog" ).children('.removeToDo').click(function(){
      var uuid = $( "#dialog" ).children('.uuid').val(); //uuid
      postDelete(uuid);
    });    

    //로그아웃 클릭시 이벤트
    $("#logout").click(function(){
      Cookies.set("jellyfishId", "DNA", { path:"/"});
      window.location.href = "login.html";
    });

    //할일 추가하기 클릭시 이벤트
    $("#makeToDo").click(function(){
      var uuid  = guid();
      $( "#dialog" ).children('.uuid').val(uuid);
      $( "#dialog" ).children('.receiver').val("");
      $( "#dialog" ).children('.modContents').val("");
      $( "#dialog" ).dialog( "open");
      $( "#dialog" ).children('.receiver').focus();
    });
 
    // '다했어요' 디비전에 설정.
    $completeGround.droppable({
      //accept: "#toDoGround > li",
      drop: function( event, ui ) {
        completeGroundFunc( ui.draggable );
      }
    });
 
    // let the toDoGround be droppable as well, accepting items from the completeGround
    $toDoGround.droppable({
      //accept: "#toDoGround > li",
      drop: function( event, ui ) {
        toDoGroundFunc( ui.draggable );
      }
    });

    function completeGroundFunc( $item ) {
      var uuid = $item.children('.uuid').text(); //uuid
      var jellyOrfish = $item.children('.jellyOrFish').text();
      if(jellyOrfish=="(Jelly)"){
        var status = $item.children('.statusReceiver').text();
        if(status!="O"){
          postUpdate(uuid,"DNA","DNA","DNA","DNA","O");
        }        
      }else{
        var status = $item.children('.statusSender').text();
        if(status!="O"){
          postUpdate(uuid,"DNA","DNA","DNA","O","DNA");
        }
        
      }
    }

    function toDoGroundFunc( $item ) {      
      var uuid = $item.children('.uuid').text(); //uuid
      var jellyOrfish = $item.children('.jellyOrFish').text(); 
      var status = "";
      if(jellyOrfish=="(Jelly)"){
        var status = $item.children('.statusReceiver').text();
        if(status!="X"){
          postUpdate(uuid,"DNA","DNA","DNA","DNA","X");
        }
      }else{
        var status = $item.children('.statusSender').text();
        if(status!="X"){
          postUpdate(uuid,"DNA","DNA","DNA","X","DNA");
        }
      }
    }

    //할일들을 화면에 뿌린다.
    function refreshToDos(){
      postGetToDos();
    }

    //삭제 한다.
    function postDelete(uuid){  
      $.ajax({
        method: "POST",      
        url: "/delete",
        data: { "uuid": uuid },
        dataType: "json",
        success:function(data){
          //console.log(data)
          refreshToDos();
          $( "#dialog" ).dialog( "close");
        },
        fail:function(receive){
          console.log('실패 했습니다. 다시 시도해주세요.');
          //console.log(receive);
        }
      });
    }

    //새로 등록 또는 업데이트 한다.
    function postUpdate(uuid, sender,receiver,contents,statusSender,statusReceiver){  
      $.ajax({
        method: "POST",      
        url: "/regNew",
        data: { "uuid": uuid, "sender" : sender, "receiver": receiver, "contents": contents, "statusSender": statusSender, "statusReceiver":statusReceiver },
        dataType: "json",
        success:function(data){
          //console.log(data)
          refreshToDos();
          $( "#dialog" ).dialog( "close");
        },
        fail:function(receive){
          console.log('실패 했습니다. 다시 시도해주세요.');
          //console.log(receive);
        }
      });
    }

    //내 할일을 받아온다.
    function postGetToDos(){  
      $.ajax({
        method: "POST",      
        url: "/getToDos",
        data: { "userName": userName },
        dataType: "json",
        success:function(toDos){

            //응답값에 존재하지 않는 메모는 삭제된 것이므로 삭제한다.
            var i = 0;
            $.each($("#toDoGround").children(".ui-widget-content"), function(){
             var uuidTmp = $("#toDoGround").children(".ui-widget-content").children(".uuid").eq(i).text();
             if(uuidTmp=="uuidDefaultValue"){
              //Do Nothing
             }else{
              var tempFlg = true;
              $.each(toDos, function(index, toDo){
              if(toDo.uuid==uuidTmp){
                tempFlg = false;
              }
              });
              if(tempFlg){
                $("#toDoGround").children(".ui-widget-content").eq(i).hide("slow");                
              }
             }
                          
             i++;
            });

           i = 0;
           $.each($("#completeGroundUl").children(".ui-widget-content"), function(){
           var uuidTmp = $("#completeGroundUl").children(".ui-widget-content").children(".uuid").eq(i).text();
           if(uuidTmp=="uuidDefaultValue"){
            //Do Nothing
           }else{
            var tempFlg = true;
            $.each(toDos, function(index, toDo){
            if(toDo.uuid==uuidTmp){
              tempFlg = false;
            }
            });
            if(tempFlg){
              $("#completeGroundUl").children(".ui-widget-content").eq(i).hide("slow");                
            }
           }
                        
           i++;
          });




            i = 0;
            $.each(toDos, function(index, toDo){
              var uuid = toDo.uuid;
              var tempFlg = true;
              i = 0;

              $.each($("#toDoGround").children(".ui-widget-content"), function(){
                var uuidTmp = $("#toDoGround").children(".ui-widget-content").children(".uuid").eq(i).text();
                if(uuid==uuidTmp){
                  $("#toDoGround").children(".ui-widget-content").children('.uuid').eq(i).text(toDo.uuid);
                  if(userName == toDo.sender){
                   $("#toDoGround").children(".ui-widget-content").children('.jellyOrFish').eq(i).text("(Fish)");
                   $("#toDoGround").children(".ui-widget-content").children('.todoImage').eq(i).attr('src', 'image/fish.png');
                   $("#toDoGround").children(".ui-widget-content").children('.ui-widget-header').eq(i).text(toDo.receiver); 
                  }else{
                   $("#toDoGround").children(".ui-widget-content").children('.jellyOrFish').eq(i).text("(Jelly)");
                   $("#toDoGround").children(".ui-widget-content").children('.todoImage').eq(i).attr('src', 'image/jelly.png');
                   $("#toDoGround").children(".ui-widget-content").children('.ui-widget-header').eq(i).text(toDo.sender); 
                  }
                 if(toDo.statusReceiver=="O" || toDo.statusSender=="O"){
                  $("#toDoGround").children(".ui-widget-content").eq(i).css("background-color","Salmon");
                 }
                 if(toDo.statusReceiver!="O" && toDo.statusSender!="O"){
                  $("#toDoGround").children(".ui-widget-content").eq(i).css("background-color","white");
                 }
                  $("#toDoGround").children(".ui-widget-content").children('.statusReceiver').eq(i).text(toDo.statusReceiver);
                  $("#toDoGround").children(".ui-widget-content").children('.statusSender').eq(i).text(toDo.statusSender);
                  $("#toDoGround").children(".ui-widget-content").children('.contents').eq(i).text(toDo.contents);
                  tempFlg = false;
                }
                i++;
              });

             i = 0;
             $.each($("#completeGroundUl").children(".ui-widget-content"), function(){
              var uuidTmp = $("#completeGroundUl").children(".ui-widget-content").children(".uuid").eq(i).text();
              if(uuid==uuidTmp){
                $("#completeGroundUl").children(".ui-widget-content").children('.uuid').eq(i).text(toDo.uuid);
                if(userName == toDo.sender){
                 $("#completeGroundUl").children(".ui-widget-content").children('.jellyOrFish').eq(i).text("(Fish)");
                 $("#completeGroundUl").children(".ui-widget-content").children('.todoImage').eq(i).attr('src', 'image/fish.png');
                 $("#completeGroundUl").children(".ui-widget-content").children('.ui-widget-header').eq(i).text(toDo.receiver); 
                }else{
                 $("#completeGroundUl").children(".ui-widget-content").children('.jellyOrFish').eq(i).text("(Jelly)");
                 $("#completeGroundUl").children(".ui-widget-content").children('.todoImage').eq(i).attr('src', 'image/jelly.png');
                 $("#completeGroundUl").children(".ui-widget-content").children('.ui-widget-header').eq(i).text(toDo.sender); 
                }
               if(toDo.statusReceiver=="O" || toDo.statusSender=="O"){
                $("#completeGroundUl").children(".ui-widget-content").eq(i).css("background-color","Salmon");
               }
               if(toDo.statusReceiver!="O" && toDo.statusSender!="O"){
                $("#completeGroundUl").children(".ui-widget-content").eq(i).css("background-color","white");
               }
                $("#completeGroundUl").children(".ui-widget-content").children('.statusReceiver').eq(i).text(toDo.statusReceiver);
                $("#completeGroundUl").children(".ui-widget-content").children('.statusSender').eq(i).text(toDo.statusSender);
                $("#completeGroundUl").children(".ui-widget-content").children('.contents').eq(i).text(toDo.contents);
                tempFlg = false;
              }
              i++;
            });
              
              if(tempFlg){
                $cloneToDo = $("#toDo").clone();
                $cloneToDo.removeAttr("id");
                $cloneToDo.removeAttr("hidden");
                $cloneToDo.children('.uuid').text(toDo.uuid);
                if(userName == toDo.sender){
                 $cloneToDo.children('.jellyOrFish').text("(Fish)");
                 $cloneToDo.children('.todoImage').attr('src', 'image/fish.png');
                 $cloneToDo.children('.ui-widget-header').text(toDo.receiver);
                }else{
                 $cloneToDo.children('.jellyOrFish').text("(Jelly)");
                 $cloneToDo.children('.todoImage').attr('src', 'image/jelly.png');
                 $cloneToDo.children('.ui-widget-header').text(toDo.sender); 
                }              
                $cloneToDo.children('.contents').text(toDo.contents);
                $cloneToDo.children('.statusReceiver').text(toDo.statusReceiver);
                $cloneToDo.children('.statusSender').text(toDo.statusSender);
                if(toDo.statusReceiver=="O" || toDo.statusSender=="O"){
                   $cloneToDo.css("background-color","Salmon");                   
                   //$cloneToDo.css({position: 'absolute'});
                   $cloneToDo.appendTo( $("#completeGroundUl") );
                }else{
                 //$cloneToDo.css({position: 'absolute'});
                 $cloneToDo.appendTo( $("#toDoGround") ); 
                }
              }
            });

            $( "li").resizable();
            $( "li").draggable({containment: "document"});

            /*$('.li').each(function() {
                var top = $(this).position().top + 'px';
                var left = $(this).position().left + 'px';
                $(this).css({top: top, left: left});
            }).css({position: 'absolute'});*/
            
            $(".modClick").click(function() {
             var srcUuid = $(this).parent().children('.uuid').text();
             var srcReceiver = $(this).parent().children('.ui-widget-header').text();
             var srcContents = $(this).parent().children('.contents').text();
             $( "#dialog" ).children('.uuid').val(srcUuid);
             $( "#dialog" ).children('.receiver').val(srcReceiver);
             $( "#dialog" ).children('.modContents').val(srcContents);
             $( "#dialog" ).dialog( "open");
             $( "#dialog" ).children('.modContents').focus();
            });

            
            
        },

        fail:function(receive){
          console.log('실패 했습니다. 다시 시도해주세요.');
          //console.log(receive);
        }
      });
    }    

    //uuid 생성
    function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }

    //login 하지 않은 상태: login.html 로 페이지를 전환한다.
    //login 한 상태       : refreshTodos 함수를 호출하여 할일들을 화면에 뿌린다.
    var userName = Cookies.get("jellyfishId");    
    if(typeof userName == 'undefined' || userName == "DNA"){
      window.location.href = "login.html";
    }else{
     $("#userName").text(userName);
     refreshToDos(); 
    }

    setInterval(function(){   
      postGetToDos();
    }, 10000);
    
  });