$(".joinBtn").on('click', function(event){

    var buttonId = this.id; 

    if ($("#"+buttonId).hasClass("leaveBtn")) {

        $.ajax({
            type: "POST",
            url: "/leaveSesssion",
            data: { id: buttonId },
            success: function(data, textStatus, jqXHR)
            {
                $("#"+buttonId).removeClass("btn-dark").addClass("btn-primary");
                $("#"+buttonId).removeClass("leaveBtn").addClass("joinBtn");
                $("#"+buttonId).html("Join Session");
                document.location.reload();
            },

        });

    } else {

        $.ajax({
            type: "POST",
            url: "/joinSession",
            data: { id: buttonId },
            success: function(data, textStatus, jqXHR)
            {
                $("#"+buttonId).removeClass("btn-primary").addClass("btn-dark");
                $("#"+buttonId).removeClass("joinBtn").addClass("leaveBtn");
                $("#"+buttonId).html("Leave Session");
                document.location.reload();
            },
    
          });

    }

});

$(".leaveBtn").on('click', function(event){

    var buttonId = this.id; 

    if ($("#"+buttonId).hasClass("joinBtn")) {

        $.ajax({
            type: "POST",
            url: "/joinSession",
            data: { id: buttonId },
            success: function(data, textStatus, jqXHR)
            {
                $("#"+buttonId).removeClass("btn-primary").addClass("btn-dark");
                $("#"+buttonId).removeClass("joinBtn").addClass("leaveBtn");
                $("#"+buttonId).html("Leave Session");
                document.location.reload();
            },
    
          });

        
    } else {

        $.ajax({
            type: "POST",
            url: "/leaveSesssion",
            data: { id: buttonId },
            success: function(data, textStatus, jqXHR)
            {
                $("#"+buttonId).removeClass("btn-dark").addClass("btn-primary");
                $("#"+buttonId).removeClass("leaveBtn").addClass("joinBtn");
                $("#"+buttonId).html("Join Session");
                document.location.reload();
            },

        });


    }

});


// function join_from_all_sessions(myid, mypage) {
//     var buttonId = myid;
//     var pageId = mypage;

//     if ($("#"+buttonId).hasClass("leaveBtn")) {

//         $.ajax({
//             type: "POST",
//             url: "/leaveSesssion",
//             data: { id: buttonId },
//             success: function(data, textStatus, jqXHR)
//             {
//                 $("#"+buttonId).removeClass("btn-dark").addClass("btn-primary");
//                 $("#"+buttonId).removeClass("leaveBtn").addClass("joinBtn");
//                 $("#"+buttonId).html("Join Session");
//                 document.location = "/allSessions"     
//             },

//         });

//     } else {

//         $.ajax({
//             type: "POST",
//             url: "/joinSession",
//             data: { id: buttonId },
//             success: function(data, textStatus, jqXHR)
//             {
//                 $("#"+buttonId).removeClass("btn-primary").addClass("btn-dark");
//                 $("#"+buttonId).removeClass("joinBtn").addClass("leaveBtn");
//                 $("#"+buttonId).html("Leave Session");
//                 document.location = "/allSessions" 
//             },
    
//           });

//     }
// }


// function leave_from_all_sessions(myid, mypage) {

//     var buttonId = myid; 
//     var pageId = mypage;

//     if ($("#"+buttonId).hasClass("joinBtn")) {

//         $.ajax({
//             type: "POST",
//             url: "/joinSession",
//             data: { id: buttonId },
//             success: function(data, textStatus, jqXHR)
//             {
//                 $("#"+buttonId).removeClass("btn-primary").addClass("btn-dark");
//                 $("#"+buttonId).removeClass("joinBtn").addClass("leaveBtn");
//                 $("#"+buttonId).html("Leave Session");
//                 document.location = "/allSessions"  
//             },
    
//           });

        
//     } else {

//         $.ajax({
//             type: "POST",
//             url: "/leaveSesssion",
//             data: { id: buttonId },
//             success: function(data, textStatus, jqXHR)
//             {
//                 $("#"+buttonId).removeClass("btn-dark").addClass("btn-primary");
//                 $("#"+buttonId).removeClass("leaveBtn").addClass("joinBtn");
//                 $("#"+buttonId).html("Join Session");
//                 document.location = "/allSessions" 
//             },

//         });


//     }
// }


// function join_from_joined_sessions(myid, mypage) {
//     var buttonId = myid;
//     var pageId = mypage;

//     if ($("#"+buttonId).hasClass("leaveBtn")) {

//         $.ajax({
//             type: "POST",
//             url: "/leaveSesssion",
//             data: { id: buttonId },
//             success: function(data, textStatus, jqXHR)
//             {
//                 $("#"+buttonId).removeClass("btn-dark").addClass("btn-primary");
//                 $("#"+buttonId).removeClass("leaveBtn").addClass("joinBtn");
//                 $("#"+buttonId).html("Join Session");
//                 document.location = "/joinSess"     
//             },

//         });

//     } else {

//         $.ajax({
//             type: "POST",
//             url: "/joinSession",
//             data: { id: buttonId },
//             success: function(data, textStatus, jqXHR)
//             {
//                 $("#"+buttonId).removeClass("btn-primary").addClass("btn-dark");
//                 $("#"+buttonId).removeClass("joinBtn").addClass("leaveBtn");
//                 $("#"+buttonId).html("Leave Session");
//                 document.location = "/joinSess"  
//             },
    
//           });

//     }
// }


// function leave_from_joined_sessions(myid, mypage) {

//     var buttonId = myid; 
//     var pageId = mypage;

//     if ($("#"+buttonId).hasClass("joinBtn")) {

//         $.ajax({
//             type: "POST",
//             url: "/joinSession",
//             data: { id: buttonId },
//             success: function(data, textStatus, jqXHR)
//             {
//                 $("#"+buttonId).removeClass("btn-primary").addClass("btn-dark");
//                 $("#"+buttonId).removeClass("joinBtn").addClass("leaveBtn");
//                 $("#"+buttonId).html("Leave Session");
//                 document.location = "/joinSess" 
//             },
    
//           });

        
//     } else {

//         $.ajax({
//             type: "POST",
//             url: "/leaveSesssion",
//             data: { id: buttonId },
//             success: function(data, textStatus, jqXHR)
//             {
//                 $("#"+buttonId).removeClass("btn-dark").addClass("btn-primary");
//                 $("#"+buttonId).removeClass("leaveBtn").addClass("joinBtn");
//                 $("#"+buttonId).html("Join Session");
//                 document.location = "/joinSess" 
//             },

//         });


//     }
// }