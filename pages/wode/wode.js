const AV = require('../../utils/leancloud-storage');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');

Page({
  data: {
    text: "Page wode",
    actionSheetHidden: true,
    actionSheetObj: null,
    student: null,
    loadingHidden: false,
    list: [],
    room_now: Student2Room,
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    getApp().checkLoginStatus(function (code, data) {
      if (code == 1) {
        that.setData({
          loadingHidden: true,
          text: 'sadfasdf',
          student: data
        })
        that.loadRooms();
      } else {
        that.setData({
          loadingHidden: true,
        })
      }

    });



  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },


  loadRooms: function () {
    var that = this;

    // 查询Student2Room
    var query = new AV.Query('Student2Room');
    var student = AV.Object.createWithoutData('Student', getApp().globalData.logined_student.objectId);

    // 查询当前登录用户加入的room
    query.equalTo('student', student);

    query.include('student,room');
    // 执行查询
    query.find().then(function (student2Rooms) {
      //嵌套的子对象，需要JSON.parse(JSON.stringify 重新赋值成json对象。
      if (student2Rooms) {
        student2Rooms.forEach(function (scm, i, a) {
          scm.set('student', JSON.parse(JSON.stringify(scm.get('student'))));
          scm.set('room', JSON.parse(JSON.stringify(scm.get('room'))));
        });
        console.log('before JSON.parse', student2Rooms);

        student2Rooms = JSON.parse(JSON.stringify(student2Rooms));

        console.log('after JSON.parse', student2Rooms);
        //更新界面
        that.setData({
          list: student2Rooms
        })

        //如果当前roomNow不存在，则切换到列表第一个加入的room，
        that.enter2Rooom(student2Rooms[student2Rooms.length - 1]);

      }
    });
  },

  enter2Rooom: function (student2room) {
    var that = this;
    //改全局内存
    getApp().globalData.room_now = student2room;
    //改本业内存
    that.setData({
      room_now: Student2Room,
    })
    //存储到本地
    console.log('存储到本地setStorageSync', student2room);
    wx.setStorageSync("room_now", student2room);
    //通知其他页面也刷新？
    console.log('通知其他页面，修改了roomnow');
    getApp().globalData.room_now_change_1 = true;
    getApp().globalData.room_now_change_2 = true;
    getApp().globalData.room_now_change_3 = true;
    getApp().globalData.room_now_change_4 = true;

     wx.setNavigationBarTitle({
        title: student2room.room.roomname,
      });
  },


  showActionSheet: function (e) {

    var index = e.currentTarget.dataset.index;
    console.log('点击了列表的：', index)
    var that = this;
    wx.showActionSheet({
      itemList: ['切换到', '退出', '解散'],
      success: function (res) {
        if (!res.cancel) {
          console.log(res.tapIndex)
          switch (res.tapIndex) {
            case 0: that.enter2Rooom(that.data.list[index]);
            case 1:
            case 2:
          }
        }
      },
    })
  },

  //跳转到创建页面
  tapCreateRoom: function () {
    wx.navigateTo({
      url: '../createroom/createroom'
    })

  },


})