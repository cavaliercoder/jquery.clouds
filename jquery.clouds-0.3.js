/**
 * jQuery.clouds - Animated clouds
 * http://www.cavaliercoder.com
 *
 * Version:   0.3
 * Date:    30/08/2015
 *
 * Permission is hereby granted to use this library under the following license:
 *
 * --
 * Copyright (c) 2011 Ryan Armstrong (www.ryanarmstrong.net.au)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * The Software shall be used for Good, not Evil.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * --
 */
(function ($) {
  $.fn.clouds = function (options) {
    // Default options
    options = $.extend({
      // xmlMap:      'clouds.xml',  // Source clouds map
      cloudCount:      20,           // Number of clouds on sky at any time
      speed:           40,           // Pixels per second
      speedVariation:  0.33,         // % Variation in cloud speeds
      bobHeight:       3,            // Pixel height to bob clouds
      bobWidth:        20,           // Width in pixels for each bob cycle
      fps:             50,           // Frames per second
      
      // Clipping: not required if the container has 'overflow' set to 'hidden'. This is ideal for performance
      clipAll:         false,        // If True, overrides all clipping settings
      clipHorz:        false,        // If True, enables left and right clipping
      clipVert:        false,        // If True, enables top and bottom clipping
      clipLeft:        false,        // Clip clouds at left of container
      clipRight:       false,        // Clip clouds at right of container
      clipTop:         false,        // Clip clouds at top of container
      clipBottom:      false,        // Clip clouds at bottom of container
      
      animate:         true          // Set to false to disable animation (useful for imcompatible browsers).
    }, options || {});
    
    // Override clip settings
    if(options.clipAll) options.clipHorz = options.clipVert = true;
    if(options.clipVert) options.clipLeft = options.clipRight = true;
    if(options.clipHorz) options.clipTop = options.clipBottom = true;
    
    // Apply cloud animation to each selected object
    return this.each(function () {
      // Create an array of cloud elements
      var sky = $(this);
      
      // Create a random cloud from the array of templates and position it randomly.
      sky.buildCloud = function buildCloud () {
        var index, template, jCloud, cloud, left, top, variation;
        
        // Grab a random cloud template
        index = Math.floor(Math.random() * sky.cloudTemplates.length);
        template =  sky.cloudTemplates[index];
        
        // Clone it
        jCloud = template.jHtml.clone();
        cloud = jCloud[0];
        
        // Position cloud randomly
        left = Math.floor(Math.random() * sky.cloudBounds.width - (template.width / 2)); // Only used for initial display
        top = Math.floor(Math.random() * sky.cloudBounds.height - (template.height / 2)); // Random start height for each cloud

        jCloud.floatLeft = left; // Desired, floating point left
        cloud.style.left = left.toString() + 'px'; // Actual left position
        
        jCloud.floatTop = top; // Desired floating point top
        cloud.style.top = top.toString() + 'px'; // Actual top position
        
        jCloud.bobRef = top; // Reference top position for bobbing.
        
        // Set background image location for map
        jCloud.backgroundLeft = template.backgroundLeft;
        jCloud.backgroundTop = template.backgroundTop;
  
        // Save template for faster access
        jCloud.template = template;
        
        // Variate speed
        variation = options.speedVariation * Math.random();
        
        if (Math.random() > 0.5) {
          variation += 1;
        } else {
          variation = 1 - variation;
        }
        
        jCloud.speed = options.speed * variation;
  
        return jCloud;
      };
      
      // Define function to animate clouds once they are populated
      sky.animateClouds = function animateClouds () {
        // Populate sky with clouds
        sky.cloudElements = new Array(options.cloudCount);
        var i;
        for (i = 0; i < options.cloudCount; i += 1) {
          sky.cloudElements[i] = sky.buildCloud(sky, sky.cloudTemplates); // Create random cloud
          sky.append(sky.cloudElements[i]); // Add it the sky container
        }
        
        if (options.animate) {
          setInterval(function animateCloud () {
            var i, jCloud, cloud;
            for (i = 0; i < options.cloudCount; i += 1) { 
              // Iterate through each cloud
              // Grab this cloud
              jCloud = sky.cloudElements[i]; // jQuery object
              cloud = jCloud[0]; // HTML DOM element
    
              // Set desired left pos
              jCloud.floatLeft -= (jCloud.speed / options.fps);
              
              // Set desired top position (apply bobbing)
              if (options.bobWidth && options.bobHeight) {
                jCloud.floatTop = jCloud.bobRef + (Math.cos(jCloud.floatLeft / (options.bobWidth / 2)) * options.bobHeight);
              }
              
              // Reset cloud if it has passed the left barrier
              if (jCloud.floatLeft < (0 - jCloud.template.width)) {
                // remove this cloud
                jCloud.remove();
                
                // replace this cloud with a new random cloud
                sky.cloudElements[i] = sky.buildCloud(sky, sky.cloudTemplates);
                jCloud = sky.cloudElements[i];
                cloud = jCloud[0];
                
                // Position the cloud in starting position
                jCloud.floatLeft = sky.cloudBounds.width - 1;
                cloud.style.left = (jCloud.floatLeft + sky.cloudBounds.left).toString() + 'px';
                if(options.clipRight) cloud.style.width = '0px';
                
                // Show this cloud
                sky.append(jCloud); 
                
                return true; // Skip out
              }
              
              // Set defaults, prior to clipping
              jCloud.newLeft = jCloud.floatLeft;
              jCloud.newTop = jCloud.floatTop;
              jCloud.newWidth = jCloud.template.width;
              jCloud.newHeight = jCloud.template.height;
              jCloud.newBackgroundLeft = jCloud.template.backgroundLeft;
              jCloud.newBackgroundTop = jCloud.template.backgroundTop;
              
              // Clip Left if required
              if (options.clipLeft && jCloud.floatLeft < 0) {
                jCloud.newLeft = sky.cloudBounds.left;
                jCloud.newWidth = Math.max(jCloud.template.width + jCloud.floatLeft, 0);
                jCloud.newBackgroundLeft = jCloud.backgroundLeft - jCloud.floatLeft;
              }
              
              // Clip Right if required
              if (options.clipRight && jCloud.floatLeft > (sky.cloudBounds.width - jCloud.template.width)) {
                jCloud.newWidth =  Math.min(sky.cloudBounds.width - jCloud.floatLeft, jCloud.template.width);
                jCloud.newLeft = sky.cloudBounds.width - jCloud.newWidth;
              }
              
              // Clip top if required
              if (options.clipTop && jCloud.floatTop < 0)
              {
                jCloud.newTop = 0;
                jCloud.newHeight = Math.min(jCloud.template.height + jCloud.floatTop, jCloud.template.height);
                jCloud.newBackgroundTop = jCloud.backgroundTop - jCloud.floatTop;
              }
              
              // Clip bottom if required
              if (options.clipBottom && (jCloud.floatTop > (sky.cloudBounds.height - jCloud.template.height))) {
                jCloud.newHeight = Math.min(sky.cloudBounds.height - jCloud.floatTop, jCloud.template.height);
                if (options.bobHeight) {
                  jCloud.newHeight -= 1;
                } // not sure why this required but if we dont, he fail the clip by 1px.
              }
               
              // Apply changes! Uses Math.ceil to ensure whole number values for valid CSS.
              // We use the DOM object 'cloud' instead of jQuery object jCloud as the .css() function in jQuery is more expensive.
              
              // Move cloud
              cloud.style.left = Math.ceil(jCloud.newLeft).toString() + 'px';
              cloud.style.top = Math.ceil(jCloud.newTop).toString() + 'px';
              
              // Apply clipping
              if(options.clipLeft || options.clipRight || options.clipTop || options.clipBottom) {
                cloud.style.width = Math.floor(jCloud.newWidth).toString() + 'px';
                cloud.style.height = Math.ceil(jCloud.newHeight).toString() + 'px';
                cloud.style.backgroundPosition = '-' + Math.ceil(jCloud.newBackgroundLeft).toString() + 'px -' + 
                                Math.ceil(jCloud.newBackgroundTop).toString() + 'px';
              }
            }
          }, (1000 / options.fps)); // Timer interval 
        }
      };

      sky.cloudBounds = {
        width : sky.width(),
        height : sky.height(),
        left : 0, //sky.position().left,
        top : 0 //sky.position().top
      };

      sky.cloudTemplates = [];
      
      // Load clouds from xmlMap
      if (options.xmlMap)
      {
        // Grab image map xml file
        $.ajax({
            type: "GET",
            url: options.xmlMap,
            dataType: "xml",
            success: function (xml) {
            
            // Create cloud elements from xml file
            sky.cloudMapSrc = $('clouds', xml).attr("src");
            var jXmlClouds = $(xml).find("cloud");
            
            // Convert XML Clouds into HTML elements
            jXmlClouds.each(function () {
              var jXmlCloud, cloud;
              
              jXmlCloud = $(this);
              cloud = { // Our cloud object
                jHtml: $('<div class="cloud"></div>'),// The jQuery / HTML object
                width:  parseInt(jXmlCloud.attr('width'), 10), // Width of this cloud
                height: parseInt(jXmlCloud.attr('height'), 10), // Height of the cloud
                backgroundLeft: parseInt(jXmlCloud.attr('left'), 10), // Background X relative to the map
                backgroundTop: parseInt(jXmlCloud.attr('top'), 10) // Background Y relative to the map
              };
                
              // Set all important CSS
              cloud.jHtml.css({
                'position' : 'absolute',
                'background-image' : 'url(' + sky.cloudMapSrc + ')',
                'background-repeat' : 'no-repeat',
                'background-position' : '-' + cloud.backgroundLeft + 'px -' + cloud.backgroundTop + 'px',
                'width' : cloud.width + 'px',
                'height' : cloud.height + 'px'
              });
              
              // Add it to the array of clouds
              sky.cloudTemplates.push(cloud);
              
            });
            
            // Start ticking!
            sky.animateClouds();
          }
        });
      }
      
      // Not loading from XML. Use inline content.
      else
      {
        // Create a cloud from each child in the container
        sky.children().each(function () {
          var jCloud, cloud, backgroundPos, i;
          jCloud = $(this);
          
          // Default background position
          backgroundPos = [0, 0];
          if (this.style.backgroundPosition)
          {
            // Convert background position to parsable pixel based integers
            backgroundPos = this.style.backgroundPosition.split(' ');
          
            // Parse each coordinate (0: left, 1:top)
            for (i = 0; i < 2; i += 1) {
              // Current coordinate is pixel based. Convert to integer
              if (backgroundPos[i].indexOf('px')) {
                backgroundPos[i] = backgroundPos[i].replace('px', '');
              }
              
              // Current coordinate is a percentage. Calculate pixel offset.
              if (backgroundPos[i].indexOf('%')) {
                backgroundPos[i] = backgroundPos[i].replace('%', '');
                backgroundPos[i] = Math.floor(((i === 0) ? jCloud.width() : jCloud.height()) * (parseInt(backgroundPos[i], 10) / 100));
              }
            }
          }
          
          // Create our cloud object
          cloud = { 
            jHtml: jCloud,
            
            // Use default dimensions as a reference for clipping
            width: jCloud.width(), 
            height: jCloud.height(),
            backgroundLeft: backgroundPos[0],
            backgroundTop: backgroundPos[1]
          };
          
          // Ensure we can move the cloud around
          jCloud.css({
            'position' : 'absolute'
          });
          
          // Add it to the list
          sky.cloudTemplates.push(cloud);
          
          // Remove it from the container
          jCloud.remove(); 
        });
        
        // Start ticking!
        sky.animateClouds();
      }
    });
  };
}(jQuery));
