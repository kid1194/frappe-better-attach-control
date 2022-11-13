/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to LICENSE file
*/

var EXTS = (
    '3g2 3gp 3gpp asf asx avi dvb f4v fli flv fvt h261 h263 h264 '
    + 'jpgm jpgv m1v m2v m4u m4v mj2 mjp2 mk3d mks mkv mng mov movie '
    + 'mp4 mp4v mpe mpeg mpg mpg4 mxu ogv pyv qt smv '
    + 'uvh uvm uvp uvs uvu uvv uvvh uvvm uvvp uvvm uvvu uvvv viv vob '
    + 'webm wm wmv wmx wvx'
).split(' ');

export default function is_video(ext) {
    return EXTS.indexOf(ext) >= 0;
}