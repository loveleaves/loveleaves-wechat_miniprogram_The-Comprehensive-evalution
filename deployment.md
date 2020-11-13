# 部署说明

1、下载该压缩包并解压，安装包的下载地址为：。

2、打开微信开发者工具，选择左上角项目—导入项目，目录选择为解压的路径，AppID需要在微信公众平台—开发—开发设置中获取。

<img src="./image/deploy/1.jpg" alt="1" style="zoom:80%;" />

3、打开位于miniprogram/pages中的app.js文件，将env更换为自己云开发的环境ID。

![2](./image/deploy/2.jpg)

4、打开云开发中的数据库，点击左上角集合名称右边的加号，添加程序所必要的集合，其名称分别为：admin_info、login_info、submit、submit1、submit2、submit3、submit4、submit5、submit6。

<img src="./image/deploy/3.jpg" alt="3" style="zoom:80%;" />

5、选择刚刚建立的数据库，在页面中央选择数据权限，将数据库权限全部设置为所有用户可读，仅创建者可读写。

<img src="./image/deploy/4.jpg" alt="4" style="zoom:70%;" />

6、选择admin_info数据库，选择页面偏左的添加记录，选择添加一个新记录后确定。

<img src="./image/deploy/5.jpg" alt="5" style="zoom:60%;" />

7、选择页面中央的添加字段，分别添加schoolnumber，username，pass1字段key，value根据个人习惯设置，建议账号密码均设置为六个1。该账号密码为登录审核端的账号密码。

<img src="./image/deploy/6.jpg" alt="6" style="zoom:60%;" />

8、右键点击cloud文件夹中的四个文件夹，点击上传并部署：云端安装依赖，以部署四个云函数。其名称分别为getOpenid、modification、remove与sendToWeChat。云函数部署完毕可能需要时间，一般来说部署完毕后五分钟后可以使用。

![7](./image/deploy/7.jpg)

9、接下来就可以编译并使用了。
