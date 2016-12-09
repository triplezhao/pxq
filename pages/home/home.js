const AV = require('../../utils/leancloud-storage');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');

Page({
  data: {
    text: "Page wode",
    actionSheetHidden: true,
    actionSheetObj: null,
    student: null,
    list: [],
    islogin: false,
  },
  onLoad: function (options) {
    wx.hideNavigationBarLoading();
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    if (getApp().globalData.logined_student) {
      //改本业内存

      that.setData({
        islogin: true,
        student: getApp().globalData.logined_student
      })

      console.log('111', that.data.islogin);
    }

    getApp().checkLoginStatus(function (code, data) {

      if (code == 1) {
        that.setData({
          text: 'sadfasdf',
          student: data,
          islogin: true
        })

        console.log('222', that.data.islogin);
        that.loadRooms();
      } else {
        that.setData({
          islogin: false
        })
      }

    });

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示

    if (getApp().globalData.refesh_change_home) {
      this.loadRooms();
    }
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },

  /**
    * 上拉刷新
    */
  onPullDownRefresh: function () {
    //加载最新
    this.loadRooms();
  },

  loadRooms: function () {

    var that = this;

    if (!getApp().globalData.logined_student) {
      return;
    }

    // 查询Student2Room
    var query = new AV.Query('Student2Room');
    var student = AV.Object.createWithoutData('Student', getApp().globalData.logined_student.objectId);

    // 查询当前登录用户加入的room
    query.equalTo('student', student);

    query.include('student,room');

    query.descending('createdAt');

    // 执行查询
    query.find().then(function (student2Rooms) {
      //嵌套的子对象，需要JSON.parse(JSON.stringify 重新赋值成json对象。
      if (student2Rooms) {
        student2Rooms.forEach(function (scm, i, a) {
          scm.set('student', JSON.parse(JSON.stringify(scm.get('student'))));
          scm.set('room', JSON.parse(JSON.stringify(scm.get('room'))));
          // scm=JSON.parse(JSON.stringify(scm));
        });
        console.log('before JSON.parse', student2Rooms);

        //解析成json标准对象存储
        student2Rooms = JSON.parse(JSON.stringify(student2Rooms));

        console.log('after JSON.parse', student2Rooms);

        //更新界面
        that.setData({
          list: student2Rooms,
          islogin: true,
        })

        // //如果当前roomNow不存在，则切换到列表第一个加入的room，
        // if (!that.data.room_now || that.data.room_now.student.objectId != student.id) {
        //   that.enter2Rooom(student2Rooms[student2Rooms.length - 1]);
        // }

      }
    });
  },

  enter2Rooom: function (student2room) {
    var that = this;
    //改全局内存
    getApp().globalData.room_now = student2room;

    wx.navigateTo({
      url: '../blackboard/blackboard'
    })

  },


  showActionSheet: function (e) {

    var index = e.currentTarget.dataset.index;
    console.log('点击了列表的：', index)
    var that = this;
    wx.showActionSheet({
      itemList: ['进入', '邀请同学', '设置'],
      success: function (res) {
        if (!res.cancel) {
          console.log(res.tapIndex)
          switch (res.tapIndex) {
            case 0:
              that.enter2Rooom(that.data.list[index]);
              break;
            case 1:
              wx.navigateTo({
                url: '../invite/invite?invitecode=' + that.data.list[index].room.objectId
              })
              break;
            case 2:
              wx.navigateTo({
                url: '../roomsetting/roomsetting'
              })
              break;
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
  //跳转到加入页面
  tapJionRoom: function () {
    wx.navigateTo({
      url: '../jionroom/jionroom'
    })

  },

})