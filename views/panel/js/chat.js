	var titleDoc=document.title;
	
	function timetoDate(tiempo){
		var date = new Date(tiempo*1000);
		// hours part from the timestamp
		var hours = date.getHours();
		// minutes part from the timestamp
		var minutes = date.getMinutes();
		// seconds part from the timestamp
		var seconds = date.getSeconds();

		// will display time in 10:30:23 format
		return  hours + ':' + minutes + ':' + seconds;
	}
	var socket=io.connect(SERVER_NODE);
	socket.on('connect',function(){
		socket.emit('adduser',$("#authenticity_ticket").val(),$("#authenticity_name").val(),'support');
	});

	socket.on("waiting",function(count){
		if(count<2){
			//bloqueamos el chat
			$("#modal-bloqued").modal({
				backdrop : 'static',
				keyboard : false
			});
		}else{
			$("#modal-bloqued").modal('hide');
		}
	});
	socket.on('writing_end',function(name){
		$('#audio_fb')[0].play();//reproducimos el sonido
		$("#writing").html('');
		document.title=name + " dice : ";
	});

	socket.on('writing',function(message){
		$("#writing").html('<b>'+message+'</b> esta escribiendo...');
	});

	socket.on('message', function(message){
        var html=''
        //console.log(message);
        message.forEach(function (data) {
        	// create a new javascript Date object based on the timestamp
			// multiplied by 1000 so that the argument is in milliseconds, not seconds
			
			//html=html+data.mensaje + ' a las '+formattedTime + '<br/>';
			var classColor=(data.nombre==$('#authenticity_name').val() ? 'text-contrast' : 'text-danger');
			var nombre=$("#authenticity_name").val();
			var body="<li class='message'> " +
					"<div class='avatar'> " +
					"<img alt='Avatar' height='23' src='"+SITE_URL+"views/layout/bootstrap_flattybs3/img/avatar.jpg' width='23'>" +
					"</div>" +
					"<div class='name-and-time'>" +
					"<div class='name pull-left'>" +
					"<small>" +
					"<a class='"+classColor+"' href='#''>"+data.nombre+"</a>" +
					"</small>" +
					"</div>" +
					"<div class='time pull-right'>" +
					"<small class='date pull-right text-muted'>" +
					"<span class='timeago  has-tooltip' data-placement='top' title='"+timetoDate(data.fecha_stamp)+"'> "+timetoDate(data.fecha_stamp)+" </span>" +
					" <i class='icon-time'></i> " +
					"</small>" +
					"</div>" +
					"</div>" +
					"<div class='body'>" +data.mensaje+
					"</div>" +
					"</li>";
			html=body+html;

		});
		$("#chat_messages").html(html);
		$(".scrollable").slimScroll({
              scrollTo: $(".scrollable").data("scrollable-height") + "px"
         });
    }); 


	function sendMessage() {
		socket.emit('insert',$("#message_body").val(),$("#authenticity_ticket").val(),$("#authenticity_name").val());
		socket.emit('writing_end',$("#authenticity_ticket").val(),$("#authenticity_name").val());
    }
    function writing(){
    	socket.emit('writing',$("#authenticity_name").val(),$("#authenticity_ticket").val());
    }

    $(function(){

    	$('<audio id="audio_fb"><source src="'+SITE_URL+'public/sound/sound_chat.mp3" type="audio/mpeg"></audio>').appendTo("body");
    	
    	$("#message_body" ).keypress(function( event ) {
    	  if ( event.which == 13 ) {		  	
		    event.preventDefault();
		    if($(this).val().length>0){
		    	sendMessage();
		    	$(this).val('');
		    }
		    
		  }

		  if($(this).val().length>0)
		  	writing();
		}).focusin(function(event) {
			document.title=titleDoc;
		});

		$(".btn-success[type='submit']").click(function(e){
			e.preventDefault();
			sendMessage();
			$("#message_body").val('');
		});

		$("#btn_close_ticket").click(function(event) {
			socket.emit('close_ticket','');
			$.post(BASE_URL+'panel/updateState',
			{'id' : $("#authenticity_ticket").val(),'state' : 3},
			 function(data) {
				window.close();				
			});
			event.preventDefault();
		});

		/*change tiempo estimado*/
		$("#tiempo_estimado").change(function(){
			var $div=$(this);
			$.post(BASE_URL+'panel/updateChangeTime',
			{
				'id' : $("#authenticity_ticket").val(),
				'time' : $div.val()
			},
			 function(data) {
				$div.parent().parent().fadeOut().fadeIn();
			});
		});

    });