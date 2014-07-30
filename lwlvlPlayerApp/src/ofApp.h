#pragma once

#include "ofMain.h"
#include "ofxAVFVideoPlayer.h"

#define NUM_WARP_POINTS 4 //power of 2

class ofApp : public ofBaseApp{
	public:
		void setup();
		void update();
		void draw();
		
		void keyPressed(int key);
		void keyReleased(int key);
		void mouseMoved(int x, int y);
		void mouseDragged(int x, int y, int button);
		void mousePressed(int x, int y, int button);
		void mouseReleased(int x, int y, int button);
		void windowResized(int w, int h);
		void dragEvent(ofDragInfo dragInfo);
		void gotMessage(ofMessage msg);
    
    std::vector<ofxAVFVideoPlayer *> videoPlayers;
    static const int N_VIDEO_PLAYERS = 1;
    
    
    
    void quadWarp(ofTexture &tex, ofPoint lt, ofPoint rt, ofPoint rb, ofPoint lb, int rows, int cols);
    int getIndex(float x, float y, float w);
    ofPoint lerp(ofPoint start, ofPoint end, float amt);
    
    ofPoint warpPoints[NUM_WARP_POINTS];
    int selectedCorner;
  
};
