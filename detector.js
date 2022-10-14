let NOSE = 0;
let LEFTEAR = 3;
let RIGHTEAR = 4;
let LEFTHAND = 9;
let RIGHTHAND = 10;
let LEFTELBOW = 7;
let RIGHTELBOW = 8;
let LEFTSHOULDER = 5;
let RIGHTSHOULDER = 6;
let LEFTFOOT = 15;
let RIGHTFOOT = 16;
let LEFTKNEE = 13;
let RIGHTKNEE = 14;
let LEFTHIP = 11;
let RIGHTHIP = 12;

function Pose(name, conditions, instructions) {
  this.name = name;
  this.conditions = conditions;
  this.instructions = instructions;
}

function Routine(name, poses) {
  this.name = name;
  this.poses = poses;
}

class PoseDetector {
  constructor(detector) {
    this.detector = detector;
    this.prediction = [];
    this.predictionsHistory = [];
    this.drafId = null;
  }

  recordPrediction(prediction) {
    if (this.predictionsHistory.length >= 100) this.predictionsHistory.pop();
    this.predictionsHistory.unshift(prediction);
    //console.log(this.predictionsHistory);
  }

  async estimatePoses(image) {
    this.prediction = await this.detector.estimatePoses(image);
    this.recordPrediction(this.prediction);
    return this.prediction;
  }
  
  detectGuitar() {
    // console.log(this.predictionsHistory[0][0].keypoints[RIGHTHAND].y);
    var now = this.predictionsHistory[0][0];
    var prev = this.predictionsHistory[1][0];
    
    if(now != undefined && prev != undefined) {
    
    now.m = (now.keypoints[LEFTHAND].y-now.keypoints[RIGHTELBOW].y)/(now.keypoints[LEFTHAND].x-now.keypoints[RIGHTELBOW].x);
    prev.m = (prev.keypoints[LEFTHAND].y-prev.keypoints[RIGHTELBOW].y)/(prev.keypoints[LEFTHAND].x-prev.keypoints[RIGHTELBOW].x);
    
    now.x = now.keypoints[RIGHTHAND].x;
    prev.x = prev.keypoints[RIGHTHAND].x;
    now.x1 = now.keypoints[RIGHTELBOW].x;
    prev.x1 = prev.keypoints[RIGHTELBOW].x;
    now.y1 = now.keypoints[RIGHTELBOW].y;
    prev.y1 = prev.keypoints[RIGHTELBOW].y;
    
    var nowIntersectionPointY = now.m*(now.x-now.x1)+now.y1;
    var prevIntersectionPointY = prev.m*(prev.x-prev.x1)+prev.y1;
    
    if(now.keypoints[RIGHTHAND].y > nowIntersectionPointY && prev.keypoints[RIGHTHAND].y < prevIntersectionPointY)
    console.log("yee");
    // console.log(now);
    //now.confidence
    
    }
    
    requestAnimationFrame(
        function() {
          this.detectGuitar();
        }.bind(this)
      );
  }
/*
  stepCompare(step) {
    if (this.prediction.length > 0) {
      var flag = 0;
      for (let condition of step) {
        if (
          this.prediction[0].keypoints[condition[0]][condition[1]] -
          this.prediction[0].keypoints[condition[3]][condition[4]] >
          condition[2]
        ) {
          console.log("condition became true");
          // console.log(
          //   this.prediction[0].keypoints[condition[0]][condition[1]] -
          //     this.prediction[0].keypoints[condition[3]][condition[4]] >
          //     condition[2]
          // );
          flag = 1;
        }
      }
      if (flag === 1) {
        return true;
      } else return false;
    }
  }
*/
/*
  async detectStep(step) {
    console.log("detecting step...");
    // console.log(step[0]);
    // console.log(step);
    if (!this.stepCompare(step)) {
      // setTimeout(this.detectStep, 100, step);
      // this.drafId = requestAnimationFrame(
      //   function () {
      //     this.detectStep(step);
      //   }.bind(this)
      // );
      requestAnimationFrame(function() {
        this.detectStep(step);
      });
    } else {
      console.log("Step detected");
      return true;
    }
  }
*/
  // async detectRoutine(routine) {
  //   console.warn("Routine Started");
  //   console.log(routine);
  //   let i = 0;
  //   // while (i < routine.length) {
  //   //   if (this.detectStep(routine[i]) === true) i++;
  //   // }
  //   routine.forEach((step)=>{this.detectStep(step)});
  //   console.warn("Routine completed");
  // }

  detectRoutine(routine, stepIndex, ctx) {
    console.log("detecting step", stepIndex+1, "of", routine.poses.length);
    ctx.style.display = "none";
    //console.log(routine[stepIndex]);
    //console.log(routine.poses[0]);
    
    document.getElementById("instruction").style.display = "block";
    document.getElementById("instruction").innerHTML = routine.poses[stepIndex].instructions;
    
    if (this.stepCompare(routine.poses[stepIndex])){ 
      console.log("detected step", stepIndex+1);
      stepIndex++;
    }

    if (stepIndex == routine.poses.length) {
      console.warn("Routine completed");
      ctx.style.display = "block";
      document.getElementById("instruction").style.display = "none";
    }
    //setTimeout(this.detectRoutine, 100, routine, stepIndex);
    else
      requestAnimationFrame(
        function() {
          this.detectRoutine(routine, stepIndex, ctx);
        }.bind(this)
      );
  }

  //new
/*
  stepCompare(step) {
    if (this.prediction.length > 0) {
      var flag = 1;

      for (let condition of step) {
        if (!(

            this.prediction[0].keypoints[condition[0]][condition[1]] -
            this.prediction[0].keypoints[condition[3]][condition[4]] >
            condition[2]

            // this.prediction[0].keypoints[condition[0]][condition[1]] - this.prediction[0].keypoints[condition[3]][condition[4]] > 100

          )) {
          flag = 0;
        }
      }
      if (flag === 1) {
        return true;
      } else return false;
    }
  }
*/

  //new new
  stepCompare(step) {
    if (this.prediction.length > 0) {
      var flag = 1;
      // console.log(step);
      //document.getElementById("instructions").innerHTML = step.instructions;

      for (let condition of step.conditions) {

        if (condition[2][0] == ">") {
          if (!(
              this.prediction[0].keypoints[condition[0]][condition[1]] - this.prediction[0].keypoints[condition[3]][condition[4]] > condition[2][1]
            )) flag = 0;
        }
        else if (condition[2][0] == "<") {
          if (!(
              this.prediction[0].keypoints[condition[0]][condition[1]] - this.prediction[0].keypoints[condition[3]][condition[4]] < condition[2][1]
            )) flag = 0;
        }
        else if (condition[2][0] == "<>") {
          if (!(
              Math.abs(this.prediction[0].keypoints[condition[0]][condition[1]] - this.prediction[0].keypoints[condition[3]][condition[4]]) < condition[2][1]
            )) flag = 0;
        }
        else if (condition[2][0] == "><") {
          if (!(
              Math.abs(this.prediction[0].keypoints[condition[0]][condition[1]] - this.prediction[0].keypoints[condition[3]][condition[4]]) > condition[2][1]
            )) flag = 0;
        }

      }
      if (flag === 1) {
        return true;
      } else return false;
    }
  }


}





//TOP RIGHT TIMER CIRCLE

//SUBPOSES (use head and feet for ratio)
//DEFAULT1 (used for enter and exit)
//handsAside
//handsUp
//squat (HIP)
