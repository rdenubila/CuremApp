
var url = "http://localhost/Curem/Novo_site/lz-admin/api/";
var urlImages = "http://localhost/Curem/Novo_site/";

urlImages = "http://192.168.0.19/Curem/Novo_site/";
url = "http://192.168.0.19/Curem/Novo_site/lz-admin/api/";

var dadosUsuario = null;


function ajustaImagens(el){

	el.find("img").each(function(index, el) {
		$(this).attr('src', urlImages+$(this).attr('src'));
		$(this).attr('width', "100%")
		$(this).removeAttr('height')
	});

	el.find("video").each(function(index, el) {
		$(this).attr('width', "100%")
	});

	el.find("video source").each(function(index, el) {
		$(this).attr('src', urlImages+$(this).attr('src'));
	});

}

// Initialize your app
var myApp = new Framework7({
  onPageInit: paginaCarregada
});

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true,
    url: "inicio.html"
});

mainView.reloadPage("inicio.html");

if(localStorage.getItem('usuarioLogado')!="null"){
	dadosUsuario = JSON.parse(localStorage.getItem('usuarioLogado'));
	console.log("usuário logado: ");
	console.log(dadosUsuario);
	myApp.closeModal(".login-screen");
}


if( $(window).width()<640 ){
	//$('meta[name=viewport]').attr('content','width=device-width, initial-scale=0.5, maximum-scale=0.5, minimum-scale=0.5, user-scalable=no, minimal-ui=1');
}

function retornaHtmlCursos(d, comprado){
	html = "";
	html += "<a href='capitulos.html?id="+d.id+"&id_user="+dadosUsuario.id+"' class=\"item cursos\">";
	html += "	<span class=\"thumb\" style=\"background-image: url('http://www.curem.com.br/arquivos/img_6105.JPG');\"></span>";
	html += "	<span class=\"txt\">"+d.titulo+"</span>";
	html += "</a>";

	return html;
}

function paginaCarregada(app, page) {

    if (page.name === 'home') {

		$.getJSON( url+"categoriasGet.php", {id_user: dadosUsuario.id} ).done(function( json ) {
			if(json.success == true){

				data = json.data;

				//CURSOS COMPRADOS
				html = "";
				for(i=0; i<data.length; i++){
					d = data[i];
					if(d.comprado){
						html += retornaHtmlCursos(d, d.comprado);
					}
				}

				$("#cursos_comprados div").remove();
				$("#cursos_comprados").append(html);

				if(html==""){
					$("#cursos_comprados").append("<p style='text-align: center'>Você ainda não adquiriu nenhum curso</p>");
				}


				//CURSOS PARA COMPRA
				html = "";
				for(i=0; i<data.length; i++){
					d = data[i];
					if(!d.comprado){
						html += retornaHtmlCursos(d);
					}
				}

				$("#cursos_disponiveis div").remove();
				$("#cursos_disponiveis").append(html);

				if(html==""){
					$("#cursos_disponiveis").remove();
				}


			}

		}).fail(function( jqxhr, textStatus, error ) {
			alert("ERRO: "+textStatus);
		});

    }


    if (page.name === 'capitulo') {

    	o = $(page.container);

    	console.log( url+"subcategoriasGet.php?"+$.param( page.query ) );

    	$.getJSON( url+"subcategoriasGet.php", page.query ).done(function( json ) {
    		console.log(json);
    		if(json.success == true){
    			d_curso = json.data;
    			o.find(".titulo").html(d_curso.titulo);
    			o.find(".texto").html(d_curso.texto);

    			if(d_curso.subtitulo!=undefined){
    				o.find(".subtitulo").html(d_curso.subtitulo);
    			}
    		}

    		if(json.data.comprado){
	    		data = json.data.subcapitulos;
	    		html = "";
				for(i=0; i<data.length; i++){
					d = data[i];
					html += "<a href='capitulos.html?id="+d_curso.id+"&sub_id="+d.id+"&id_user="+dadosUsuario.id+"' class=\"item capitulos\">";
					html += "	<span class=\"txt\">"+d.titulo+"</span>";
					html += "</a>";
				}
				o.find(".subcats").html(html);

				ajustaImagens(o);
			} else {

				html = "";
				html += "<div class=\"item destaque\">";

				html += "	<h2>Compre o curso</h2>";
				html += "	<p><i class='icon-price-tag'></i> Preço: "+d.preco_formatado+"</p>";
				html += "	<p><a href='"+url+"cursoComprar.php?id_curso="+d.id+"&id_user="+dadosUsuario.id+"' target='_blank' class='btn external'><i class='icon-cart'></i> Comprar</a></p>";
				
				html += "</div>";



				o.find(".subcats").html(html);
			}

    	}).fail(function( jqxhr, textStatus, error ) {
			console.log("ERRO: "+error);
		});
    }

    if (page.name === 'compras') {

    	$.getJSON( url+"comprasGet.php", {id_user: dadosUsuario.id} ).done(function( json ) {

			if(json.success == true){

				data = json.data;
	    		html = "";
				for(i=0; i<data.length; i++){

					d = data[i];

					html += "<div class=\"item destaque\">";

					html += "	<h2>"+d.nome_curso+"</h2>";
					html += "	<p><i class='icon-price-tag'></i> Preço: "+d.valor+"</p>";
					html += "	<p><i class='icon-clock2'></i> Data da Compra: "+d.data_cadastro+"</p>";
					html += "	<p><i class='icon-notification'></i> Status: "+d.status+"</p>";
					
					html += "</div>";
				}

				$("#lista_compras div").remove();
				$("#lista_compras").append(html);

			}

    	}).fail(function( jqxhr, textStatus, error ) {
			console.log("ERRO: "+error);
		});

    }


    if (page.name === 'dados') {

    	o = $(page.container);

    	$.getJSON( url+"cadastroGet.php", { id: dadosUsuario.id } ).done(function( json ) {

    		o.find(".carregando").remove();

			if(json.success){

				$.each(json.data, function (key, data) {
					o.find("#"+key).val(data);
				});

			}
			

		}).fail(function( jqxhr, textStatus, error ) {
			console.log("ERRO: "+error);
		});

	}



	if (page.name === 'agenda') {
		$.getJSON( url+"agendaGet.php" ).done(function( json ) {
			console.log(json);
			if(json.success == true){

				cursos = json.data;
	    		html = "";
				for(i=0; i<cursos.length; i++){
					c = cursos[i];
					html += "<h3>"+c.titulo+"</h3>";

					for(j=0; j<c.datas.length; j++){
						d = c.datas[j];
						html += "<div class=\"item destaque\">";

						html += "	<p><i class='icon-location'></i> Local: "+d.cidade+"</p>";
						html += "	<p><i class='icon-calendar'></i> Data: "+d.data+"</p>";

						if(d.possui_vagas){
							html += "	<p><a href='"+d.link+"' target='_blank' class='btn external'><i class='icon-file-text2'></i> "+d.link_label+"</a></p>";
						} else {
							html += "	<p>As vagas para esse curso estão esgotadas. <a href='"+d.link+"' target='_blank' class='external'>"+d.link_label+"</a></p>";
						}
						
						html += "</div>";
					}

				}

				$("#lista_agenda div").remove();
				$("#lista_agenda").append(html);

			}
		

		}).fail(function( jqxhr, textStatus, error ) {
			console.log("ERRO: "+error);
		});
	}

}


function logout(){
	localStorage.setItem('usuarioLogado', null);
	location.reload();
}

function login(){
	event.preventDefault();
	myApp.showIndicator();

	$.getJSON( url+"loginGet.php?"+$('#form_login').serialize() ).done(function( json ) {

		var dadosUsuario = json.data;

		localStorage.setItem('usuarioLogado', JSON.stringify(dadosUsuario));

		myApp.hideIndicator();
		myApp.closeModal(".login-screen");

	}).fail(function( jqxhr, textStatus, error ) {
		console.log("ERRO: "+error);
	});
}

function pegaCadastro(){

	email = $("#form_cadastro #email").val();

	if(email!=""){

		$.getJSON( url+"cadastroGet.php", { email: email } ).done(function( json ) {

			if(json.success){

				if(json.permiteCadastro){
					$.each(json.data, function (key, data) {
						$("#form_cadastro #"+key).val(data);
					});
				} else {
					alert("Este e-mail já está cadastrado!");
					$('#form_cadastro input').val("");
					myApp.closeModal('.popup-cadastro');
				}

			}
			

		}).fail(function( jqxhr, textStatus, error ) {
			console.log("ERRO: "+error);
			alert("ERRO: "+error);
		});

	}
}

function salvaCadastro(){

	event.preventDefault();
	myApp.showIndicator();

	$.getJSON( url+"cadastroSet.php?"+$('#form_cadastro').serialize() ).done(function( json ) {

		myApp.hideIndicator();

		if(json.success){
			$('#form_cadastro input').val("");
			alert("Dados salvos com suesso!");
			myApp.closeModal('.popup-cadastro');
		} else {
			alert("Erro ao cadastrar, tente novamente mais tarde.");
		}

	}).fail(function( jqxhr, textStatus, error ) {
		console.log("ERRO: "+error);
	});
}

function recuperarSenha(){

	event.preventDefault();
	myApp.showIndicator();

	$.getJSON( url+"senhaGet.php?"+$('#form_senha').serialize() ).done(function( json ) {

		myApp.hideIndicator();

		alert(json.msg);

		if(json.success){
			$('#form_senha input').val("");
			myApp.closeModal('.popup-senha');
		}

	}).fail(function( jqxhr, textStatus, error ) {
		console.log("ERRO: "+error);
	});

}

$( document ).ready(function() {

});