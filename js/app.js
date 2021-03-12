$(document).ready(function(){
  var manager = new GameManager();

  //starting app and events
  manager.startApp({
    //event while title changes color
    startTitleAnimation: function(start){
      color1 = "white";
      color2 = "yellow";
      intermediateTime = 600;
      whileAnim = function(color){
        $(".main-titulo").css("color", color);
      }

      start(color1, color2, intermediateTime, whileAnim);
    },

    //event itemClick
    itemClick: function(hasSiblings, oldItems){
      if(hasSiblings && !app.itemsAnimated()){
        this.delAndAddNews(oldItems);
      }
    },

    //event when items Match
    itemsMatchEvent: function(siblings){
      if(!siblings.is(":animated")){
        this.delAndAddNews($(siblings));
      }
    },

    //event move item
    itemsMovedEvent: function(itemDropped, itemChanged){
      if(!this.itemsAnimated()) this.verifyElements();
      this.moves++;
      $("#movimientos-text").text(this.moves)
    },

    //event restart
    restarEvent: function(){
      if(this.gameisOver){
        this.restorePanels(startGame);
      }
      else{
        startGame();
      }

      manager = this;

      function startGame(){
        Timer.restartCount();

        manager
        .generateNewItems()
        .resetValues()
        .startCountDown("02:00");
      }
    },

    //event after items match
    afterItemsMatch: function(points){
      if(points>0){
        this.globalPoints += points;
        $("#score-text").text(this.globalPoints);
        $("#score-text").effect("pulsate", 300);
      }
    },

    //event while timeCountDown
    countDownEvent: function(timeStr){
      $("#timer").text(timeStr);
      if(timeStr=="00:15"){
        $("#timer").effect("pulsate", {times:10}, 10000, function(){
          $(this).effect("pulsate", {times:10}, 5000);
        })
      }
    },

    //event when game ends
    gameOverEvent: function(manager){
      manager.gameisOver = true;
      $(".time").hide("slow");

      $(".panel-score").css("justifyContent", "flex-start");
      $(".panel-score").children().css({marginBottom:40});

      $("[class^='col'] img").stop();
      $("[class^='col'] img").hide("fade", 1000, function(){
        $(this).parent().empty();
      })

      $(".gameover-text").show("fade", 1000);
      $(".panel-tablero").animate({
        width: "0%",
        border: "0px"
      }, 1000, function(){
        $(this).hide();
      });

      $(".panel-score").animate({
        width: "100%"
      }, 1000);
    },

    //initialing btnRestart
    btnRestart: $(".btn-reinicio"),
  });
})

function GameManager(){
  var app = this;
  this.gameisOver = false;
  this.gameStarted = false;
  this.globalPoints = 0;
  this.moves = 0;
  this.elementsManager = {
    getSibling: function(dir, elemento, vecinos, getWidthSameImage){
      var item = $(elemento);
      var itemToReturn = ""
      if(dir == "arriba") itemToReturn = item.prev();
      else if(dir == "abajo") itemToReturn = item.next();
      else{
        columnNumber = Number(item.parent().attr("class").split("col-")[1]);
        posicion = $(elemento).index()

        if(dir == "derecha"){
          itemToReturn = $($(".col-"+(columnNumber+1)).children()[posicion]);
        }
        else if(dir == "izquierda"){
          itemToReturn = $($(".col-"+(columnNumber-1)).children()[posicion]);
        }
      }

      if(getWidthSameImage){
        //se verifica si el vecino tiene la misma imagen
        if((item.attr("src")==itemToReturn.attr("src")) && (!itemToReturn.is(":animated"))){

          //recorre el array de vecinos
          //para verificar que el itemToReturn no este ya en la lista
          for (var i = 0; i < vecinos.length; i++) {

            //si es igual se retornara false
            haveSameColumn = (itemToReturn.parent().attr("class") == $(vecinos[i]).parent().attr("class"));
            haveSamePosition  = ($(itemToReturn[0]).index() == $(vecinos[i]).index());

            if(haveSameColumn && haveSamePosition) return false;
          }

          //si vecinos es false se retorna el itemToReturn
          return itemToReturn[0];
        }
      }else{
        if(itemToReturn.length>0) return itemToReturn[0];
      }
      //retorna false si no tienen imagenes iguales o si el objeto es nullo
      return false;
    },

    getAllSiblings: function(item, getAllWidthSameImage){
      //metodo para obtener posibles cuatro vecinos cercanos

      var dirs = ["arriba", "abajo", "derecha", "izquierda"];
      var vecinos = [];

      if(getAllWidthSameImage){
        vecinos.push(item[0]);
        //se recorre los vecinos y se agregan nuevos
        for (var i = 0; i < vecinos.length; i++) {

          //se obtiene vecinos del item con imagen igual
          for (var j = 0; j < dirs.length; j++) {
            var vecino = this.getSibling(dirs[j], vecinos[i], vecinos, getAllWidthSameImage);

            //se verifica si el vecino tiene imagenes iguales
            if(vecino) vecinos.push(vecino)
          }
        }

        //verifica si el tamano del arreglo es mayor a 3
        if(vecinos.length>2){
          vecinos = $(vecinos);
          vecinos.addClass("borrar")
          return vecinos;
        }

        return false;
      }else{
        for (var i = 0; i < 4; i++) {
          var vecino = this.getSibling(dirs[i], item[0], vecinos, false);

          //se verifica si el vecino tiene imagenes iguales
          if(vecino) vecinos.push(vecino)
        }
        if(vecinos.length>0) return vecinos;
      }
    },

    itemDroppSettings: {
      accept: ".itemFloating",
      drop: function(event, ui){
        itemClon = ui.draggable.clone();
        itemToReplaceClon = $(this).clone();

        items = $([itemClon[0], itemToReplaceClon[0]]);
        items.removeAttr("style");
        items.removeClass("ui-draggable-dragging ui-droppable siblings itemFloating");
        items.click(app.elementoClick);
        items.draggable(app.elementsManager.itemDraggSettings);

        $(this).replaceWith(itemClon);
        ui.draggable.replaceWith(itemToReplaceClon);
        app.itemsMovedEvent(itemClon[0], itemToReplaceClon[0]);

        $(".siblings").droppable("destroy");
        $(".siblings").removeClass("siblings");
      }
    },

    itemDraggSettings: {
      revert:true,
      start: function(){
        $(this).addClass("itemFloating");
        siblings = $(app.elementsManager.getAllSiblings($(this)));
        siblings.addClass("siblings");
        siblings.droppable(app.elementsManager.itemDroppSettings);
        $(this).css("z-index", "2")
      },
      stop: function() {
        $(this).removeClass("itemFloating");
        $(".siblings").droppable("destroy");
        $(".siblings").removeClass("siblings");
        $(this).css("z-index", "")
      }
    }
  }

  this.startApp = function(settings){
    app.startTitleAnimation = settings.startTitleAnimation;
    app.titleAnimation = settings.titleAnimation;
    app.itemClick = settings.itemClick;
    app.itemsMatchEvent = settings.itemsMatchEvent;
    app.restarEvent = settings.restarEvent;
    app.afterItemsMatch = settings.afterItemsMatch;
    app.countDownEvent = settings.countDownEvent;
    app.itemsMovedEvent = settings.itemsMovedEvent;
    app.gameOverEvent = settings.gameOverEvent;

    Timer.setManager(app);
    app.startTitleAnimation(app.startColorChanger);
    settings.btnRestart.click(app.reestartGame);

    return app;
  }

  this.restorePanels = function(startGame){
    $(".panel-score, .panel-tablero").effect("pulsate", 300, function(){
      $(this).removeAttr("style");
      $(".time").show();
      startGame();
    })
  }

  this.itemsAnimated = function(){
    return $("[class^='col'] img").is(":animated");
  }

  this.generateNewItems = function(){
    $("div[class^='col']").empty();
    $("div[class^='col']").each(function(){

      var elementos = "";
      if($(this).attr("class")=="col-1") elementos = app.getRandomItems(7);
      else elementos = app.getRandomItems(7, $(this).prev().children());

      for(var i = 0; i<elementos.length; i++){
        var itemBase = $(elementos[i]);
        itemBase.click(app.elementoClick);
        itemBase.draggable(app.elementsManager.itemDraggSettings);
        $(this).append(itemBase);
      }
    });

    return app;
  }

  this.resetValues = function(){
    app.globalPoints = 0;
    app.gameStarted = true;
    app.gameisOver = false;
    app.moves = 0;
    $(".panel-score").removeAttr("style");
    $(".panel-score").children().removeAttr("style");
    $("#timer").stop(true);
    $("#score-text, #movimientos-text").stop().text("0");
    $(".gameover-text").hide();

    return app;
  }

  this.startCountDown = function(time){
    Timer.startTimeCountDown(time, app.countDownEvent, app.gameOverEvent);
  }

  this.delAndAddNews = function(itemsVecinos){
    app.afterItemsMatch(itemsVecinos.length*10);
    itemsVecinos.effect("pulsate", 800,function(){
      var newItem = $(app.getRandomItems(1)[0])
      firstItemSrc = $(this).parent().children().first().attr("src")

      if(newItem.attr("src") == firstItemSrc){
        while(newItem.attr("src") == firstItemSrc){
          newItem = $(app.getRandomItems(1)[0]);
        }
      }

      newItem.css("display", "none");
      newItem.click(app.elementoClick);
      $(this).parent().prepend(newItem);
      newItem.show("slow", function(){
        $(this).removeAttr("style");
        newItem.draggable(app.elementsManager.itemDraggSettings);
        setTimeout(function(){
          app.verifyElements();
        }, 300)
      });

      itemsVecinos.hide("slow", function(){
        $(this).remove();
      });
    })
  }

  this.startColorChanger = function(color1, color2, time, duringChange){
    function changeToColor1(){
      duringChange(color1)
      setTimeout(function(){
        changeToColor2();
      },time)
    }
    function changeToColor2(){
      duringChange(color2)
      setTimeout(function(){
        changeToColor1();
      }, time);
    }

    changeToColor1();
  };

  this.elementoClick = function(){
    if (!$(this).is(":animated")){
      itemsVecinos = getItemsVecinos($(this));
      hasVecinos = Boolean(itemsVecinos);
      app.itemClick(hasVecinos, itemsVecinos);
    }

    function getItemsVecinos(item){
      return app.elementsManager.getAllSiblings(item, true);
    }
  }

  this.getRandomItems = function(amount, vecinos){
    var items = [];
    for (var i = 0; i < amount; i++) {
      var randomNumber = getRandomNumber(1,5);

      if(i>1){
        var lastNumber = Number($(items[i-2]).attr("src").split("/")[1].split(".")[0]);

        if(vecinos){
          var lastNumberVecino = Number($(vecinos[i]).attr("src").split("/")[1].split(".")[0]);
          if((randomNumber == lastNumber) || (randomNumber == lastNumberVecino)){
            randomNumber = getNumberExcluding([getRandomNumber(1,5),1,2,4], lastNumber, lastNumberVecino);
          }
        }else{
          randomNumber = getNumberExcluding([getRandomNumber(1,5),1,2,4], lastNumber);
        }
      }else{
        if(vecinos){
          var lastNumberVecino = Number($(vecinos[i]).attr("src").split("/")[1].split(".")[0]);
          if(randomNumber == lastNumberVecino){
            randomNumber = getNumberExcluding([4,3,2,1], lastNumberVecino);
          }
        }
      }

      var itemBase = "<img class='elemento' src='image/"+randomNumber+".png'>";
      items.push(itemBase)
    }

    function getNumberExcluding(list, value1, value2){
      for (var i = 0; i < list.length; i++) {
        if(value2){
          if((list[i]!=value1) && (list[i]!=value2)) return list[i];
        }
        else{
          if(list[i] != value1) return list[i];
        }
      }
    }

    function getRandomNumber(min, max){
      return Math.floor(Math.random() * (max - min) ) + min;;
    }

    return items;
  }

  this.verifyElements = function(){
    items = $("[class^='col']").children();
    for (var i = 0; i < items.length; i++) {
      item = $(items[i]);
      if(!item.is(":animated")){
        siblings = app.elementsManager.getAllSiblings(item, true);
        this.itemsMatchEvent($(siblings));
      }
    }
  }

  this.reestartGame = function(){
    $(".btn-reinicio").text("reiniciar");
    app.gameStarted = true;

    app.restarEvent();
  }
}
