var Timer = {
  setManager: function(manager){
    this.manager = manager;
  },
  startTimeCountDown: function(time, duringCountDown, callBack){
    timeSplited = time.split(":");
    countMins = Number(timeSplited[0]);
    countSecs = Number(timeSplited[1]);
    app = this.manager;

    function start(){
      var mins = countMins.toString();
      var secs = countSecs.toString();
      if(countMins<10) mins = "0"+mins;
      if(countSecs<10) secs = "0"+secs;

      duringCountDown(mins+":"+secs);

      if(countSecs==0){
        if(countMins==0){
          return callBack(app);
        }else{
          countSecs = 60;
          countMins--;
        }
      }

      Timer.count = setTimeout(function(){
        countSecs--;
        start();
      }, 1000);

    }

    start();
  },
  restartCount: function(callBack){
    if(this.count) clearTimeout(this.count);
  }
}
