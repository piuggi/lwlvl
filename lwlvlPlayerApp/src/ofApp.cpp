#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){

    for(int i=0; i<N_VIDEO_PLAYERS; i++) {
        videoPlayers.push_back(new ofxAVFVideoPlayer());
        //videoPlayers[i]->loadMovie("test.mov"); //TODO: for multiple videos
    }
    
    selectedCorner = -1;
    
    int VIDEO_WIDTH = 4447;
    int VIDEO_HEIGHT = 809;
    
    warpPoints[0].set(0,0);
    warpPoints[1].set(VIDEO_WIDTH,0);
    warpPoints[2].set(VIDEO_WIDTH,VIDEO_HEIGHT);
    warpPoints[3].set(0,VIDEO_HEIGHT);
    
    //playing with stuffs
    ofSetVerticalSync(true);
    ofSetBoxResolution(1000);
    ofEnableSmoothing();
    ofEnableTextureEdgeHack();
    ofEnableAntiAliasing();
    
    videoPlayers[0]->loadMovie("Vanishing_1.mov"); //loading just 1 video for now
    
    ofSetWindowShape(VIDEO_WIDTH+60, VIDEO_HEIGHT+60); //add a little border outside video
}

//--------------------------------------------------------------
void ofApp::update(){
    
//TODO: FOR WHEN N_VIDEO_PLAYERS > 1
//    int i=0;
//    for(auto p : videoPlayers) {
//        p->update();
//        if(true || p->isLoaded()) {
//            if(ofGetElapsedTimef() > i++ * 0.5)
//                p->play();
//        }
//    }

    videoPlayers[0]->update();
    
    if(videoPlayers[0]->isLoaded()){

        videoPlayers[0]->play();

//TODO: set warpPoints starting points HERE, but ONLY ONCE
//        warpPoints[0].set(0,0);
//        warpPoints[1].set(videoPlayers[0]->getWidth()/2,0);
//        warpPoints[2].set(videoPlayers[0]->getWidth()/2,videoPlayers[0]->getHeight()/2);
//        warpPoints[3].set(0,videoPlayers[0]->getHeight()/2);
    }
}

//--------------------------------------------------------------
void ofApp::draw(){
    
    ofTranslate(30, 30);

//TODO: FOR WHEN N_VIDEO_PLAYERS > 1
//    int i=0;
//    for(auto p : videoPlayers) {
//        //p->draw(ofMap(i++, 0, videoPlayers.size(), 0, ofGetWidth()), ofGetHeight()/2 - 108*2, 192*4, 108*4);
//        p->draw(0,0,p->getWidth()/2, p->getHeight()/2);
//    }

    if(videoPlayers[0]->isLoaded())
        quadWarp(videoPlayers[0]->getTextureReference() , warpPoints[0], warpPoints[1], warpPoints[2], warpPoints[3], 40, 40);
    
    for (int i=0; i<4; i++) {
        ofCircle(warpPoints[i],10);
    }
}

//--------------------------------------------------------------
ofPoint ofApp::lerp(ofPoint start, ofPoint end, float amt) {
    return start + amt * (end - start);
}

//--------------------------------------------------------------
int ofApp::getIndex(float x, float y, float w) {
    return y*w+x;
}

//--------------------------------------------------------------
void ofApp::quadWarp(ofTexture &tex, ofPoint lt, ofPoint rt, ofPoint rb, ofPoint lb, int rows, int cols) {
        float tw = tex.getWidth();
        float th = tex.getHeight();

    ofMesh mesh;
    
    for (int x=0; x<=cols; x++) {
        float f = float(x)/cols;
        ofPoint vTop(lerp(lt,rt,f));
        ofPoint vBottom(lerp(lb,rb,f));
        ofPoint tTop(lerp(ofPoint(0,0),ofPoint(tw,0),f));
        ofPoint tBottom(lerp(ofPoint(0,th),ofPoint(tw,th),f));
        
        for (int y=0; y<=rows; y++) {
            float f = float(y)/rows;
            ofPoint v = lerp(vTop,vBottom,f);
            mesh.addVertex(v);
            mesh.addTexCoord(lerp(tTop,tBottom,f));
        }
    }
    
    for (float y=0; y<rows; y++) {
        for (float x=0; x<cols; x++) {
            mesh.addTriangle(getIndex(x,y,cols+1), getIndex(x+1,y,cols+1), getIndex(x,y+1,cols+1));
            mesh.addTriangle(getIndex(x+1,y,cols+1), getIndex(x+1,y+1,cols+1), getIndex(x,y+1,cols+1));
        }
    }
    
    tex.bind();
    mesh.draw();
    tex.unbind();
    mesh.drawVertices();
}



//--------------------------------------------------------------
void ofApp::keyPressed(int key){

    switch(key) {
        case '1':
            videoPlayers[0]->loadMovie("1.mp4");
            break;
        case '2':
            videoPlayers[1]->loadMovie("TheLumineers_1.mov");
            videoPlayers[1]->setVolume(0.0f);
            break;
        case '3':
            videoPlayers[2]->loadMovie("EmeliSande_NextToMe.mov");
            videoPlayers[2]->setVolume(0.0f);
            break;
        case '4':
            videoPlayers[3]->loadMovie("iHRMF2012_SwedishHouseMafia_DontWorryChild.mov");
            videoPlayers[3]->setVolume(0.0f);
            break;
        case 'f':
            ofToggleFullscreen();
            break;
    }
}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){

}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y){

}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){
    if(selectedCorner > -1) warpPoints[selectedCorner].set(x-30,y-30);
}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){
    selectedCorner = -1;
    for (int i=0; i<4; i++) {
        if (ofDist(warpPoints[i].x, warpPoints[i].y, x-30, y-30)<10) {
            selectedCorner = i;
            cout << "selectedCorner = "<<selectedCorner;
        }
    }
}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){
    selectedCorner = -1;
}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){ 

}