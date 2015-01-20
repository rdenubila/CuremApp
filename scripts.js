
var url = "http://localhost/Curem/Novo_site/lz-admin/api/";
var urlImages = "http://localhost/Curem/Novo_site/";
var estaConectado = true;
var dadosUsuario = null;
var cursosOffline = [];


// TESTE LOCAL
urlImages = "http://192.168.0.19/Curem/Novo_site/";
url = "http://192.168.0.19/Curem/Novo_site/lz-admin/api/";


if(localStorage.getItem('cursosOffline')!="null" && localStorage.getItem('cursosOffline')!=null){
	cursosOffline = JSON.parse(localStorage.getItem('cursosOffline'));
} else {
	//cursosOffline  = JSON.parse();
}

console.log("cursosOffline: ");
console.log(cursosOffline);


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

if(localStorage.getItem('usuarioLogado')!="null" && localStorage.getItem('usuarioLogado')!=null){
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

function ajustaHome(data){
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

function paginaCarregada(app, page) {

    if (page.name === 'home') {

    	if(estaConectado){

    		$.getJSON( url+"categoriasGet.php", {id_user: dadosUsuario.id} ).done(function( json ) {
				if(json.success == true){

					ajustaHome(json.data);

					localStorage.setItem('categoriasGet', JSON.stringify(json.data));

				}

			}).fail(function( jqxhr, textStatus, error ) {
				alert("ERRO: "+textStatus);
			});

    	} else {
    		if(localStorage.getItem('categoriasGet')!=null && localStorage.getItem('categoriasGet')!="null"){
    			data = JSON.parse(localStorage.getItem('categoriasGet'));
    			ajustaHome(data);
    		} else {
    			alert("Você deve estar conectado para acessar o aplicativo");
    		}

    	}

		

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


				//ADICIONA BOTÃO PARA ACESSAR OFFLINE
				if(estaConectado && page.query.sub_id==null){
					html += "<p>";
					html += "	<a href='javascript: tornarOffline("+d_curso.id+")' class='btn external'><i class='icon-cloud-download'></i> Tornar conteúdo off-line</a>";
					html += "</p>";

					o.find(".subcats").html(html);				
				}

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

var DownloadFiles;
var indexDownload = 0;
var dowloadingCurso = 0;
function tornarOffline(id_curso){

	dowloadingCurso = id_curso;
	
	myApp.popup(".popup-download");

	indexDownload = 0;

	$.getJSON( url+"arquivosGet.php", { id: id_curso} ).done(function( json ) {

		if(json.success == true){

			data = json.data;
    		html = "";
			for(i=0; i<data.length; i++){
				d = data[i];

				var urlToFile;
				switch(d.tipo){
					case "json":
						urlToFile = url+"json/";
						break;

					default:
						urlToFile = urlImages;		
						break;				

				}
				

				d.fileURL = urlToFile+d.file;
				
			}

			DownloadFiles = data;
			baixarConteudoControle();

		}

		

	}).fail(function( jqxhr, textStatus, error ) {
		console.log("ERRO: "+error);
	});
}

function baixarConteudoControle(){
	if(indexDownload<DownloadFiles.length){
		baixarConteudo(DownloadFiles[indexDownload].fileURL);
	} else {
		alert("O conteúdo foi baixado com sucesso!");
		alert(dowloadingCurso);
	}

	p = DownloadFiles.length/indexDownload*100;
	$(".progress-bar div").css("style", "width: "+p+"%")

	indexDownload++;
}

function baixarConteudo(arquivo){

	alert("arquivo: "+arquivo);

	var fileName = arquivo.substr(arquivo.lastIndexOf('/')+1);

	alert("nome: "+fileName);

	var fileTransfer = new FileTransfer();
	var uri = encodeURI(arquivo);


	alert("uri: "+uri);

	var fileURL = "cdvfile://localhost/persistent/"+fileName;

	fileTransfer.download(
	    uri,
	    fileURL,

	    function(entry) {
	        alert("download complete: " + entry.toURL());
	        baixarConteudoControle();
	    },

	    function(error) {
	        alert("download error source " + error.source);
	        alert("download error target " + error.target);
	        alert("upload error code" + error.code);
	    },

	    true
	);
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


// EVENTOS

document.addEventListener("deviceready", function(){
	alert("Aplicativo inicializado!");
}, false);

document.addEventListener("backbutton", function(){
	alert("Voltar");
	mainView.router.back();
}, false);



$( document ).ready(function() {

});