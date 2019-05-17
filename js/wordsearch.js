(function(){
  'use strict';

  // Extend the element method
  Element.prototype.wordSeach = function(settings) {
    return new WordSeach(this, settings);
  }

  /**
   * Word search
   *
   * @param {Element} wrapWl the games wrap element
   * @param {Array} settings
   * constructor
   */
  function WordSeach(wrapEl, settings) {
    
    this.wrapEl = wrapEl;

    // Add `.ws-area` to wrap element
    this.wrapEl.classList.add('ws-area');

	
	var mid = gup('mid');
	
    // Default settings
    var default_settings = {
      'directions': ['W', 'N', 'WN', 'EN'],
      'gridSize': 18,
      'words': [
	     'throne',
		'palace',
		'tradition',
		'family',
		'descent',
		'royal',
		'kingdom',
		'prince',
		'law',
		'earl',
		'government',
		'charter',
		'sovereign',
		'orb',
		'commons'
	  ],
      'debug': false,
	  'condition' : 0,
	  'same' : true,
	  'test' : false
    }

    this.settings = Object.merge(settings, default_settings);
    //this.settings.condition = 5;   //need to remove this
   
	
    // Check the words length if it is overflow the grid
    if (this.parseWords(this.settings.gridSize)) {
      // Add words into the matrix data
      var isWorked = false;
	  
	  if (this.settings.test) {
			this.words = ['browser'];
	  }
	
      while (isWorked == false) {
        // initialize the application
        this.initialize();
		if (this.settings.test) {
			isWorked = this.testmatrix(this.settings.gridSize);
		} else {
		if (!this.settings.same) {
		       
			isWorked = this.addWords();
		} else {
		    isWorked = this.bobmatrix(this.settings.gridSize);
		}
		}
      }

      // Fill up the remaining blank items
      if (!this.settings.debug) {
	     if (!this.settings.test) {
			this.fillUpFools();
		 }
		//disable this to check earlystop
      }

      // Draw the matrix into wrap element
      this.drawmatrix();
	  
	  //added by bob to show score - require score function in the bob script
	  var currentscore = score();
	  document.getElementById("score").innerHTML = "Found " + currentscore + " out of " + this.settings.words.length + " words so far.";
    }
  }

  
  /**
   * Parse words
   * @param {Number} Max size
   * @return {Boolean}
   */
  WordSeach.prototype.parseWords = function(maxSize) {
    var itWorked = true;

    for (var i = 0; i < this.settings.words.length; i++) {
      // Convert all the letters to upper case
      this.settings.words[i] = this.settings.words[i].toUpperCase();

      var word = this.settings.words[i];
      if (word.length > maxSize) {
        alert('The length of word `' + word + '` is overflow the gridSize.');
        console.error('The length of word `' + word + '` is overflow the gridSize.');
        itWorked = false;
      }
    }

    return itWorked;
  }

  /**
   * Put the words into the matrix
   */
  WordSeach.prototype.addWords = function() {
	  //modified this function to make impossible puzzles when condition = 1



      
	  var condition = this.settings.condition;
	  var endoflist = this.settings.words.length;	//default to add all words
	  if (condition == 1) {
		endoflist = 3;					//if condition = 1 then only add first two words
	  }
	  
	  if (this.settings.test) {
		endoflist = 1;
      }
  
      var keepGoing = true,
        counter = 0,
        isWorked = true;

      while (keepGoing) {
        // Getting random direction
        var dir = this.settings.directions[Math.rangeInt(this.settings.directions.length - 1)],
          result = this.addWord(this.settings.words[counter], dir),
          isWorked = true;

        if (result == false) {
          keepGoing = false;
          isWorked = false;
        }

        counter++;
//        if (counter >= this.settings.words.length) {
// 			modified this line from original to creat earlystop when condition = 1
        if (counter >= endoflist) {
          keepGoing = false;
        }
		

      }

      return isWorked;
  }

  
  
  /**
   * Add word into the matrix
   *
   * @param {String} word
   * @param {Number} direction
   */
  WordSeach.prototype.addWord = function(word, direction) {
    var itWorked = true,
      directions = {
        'W': [0, 1], // Horizontal (From left to right)
        'N': [1, 0], // Vertical (From top to bottom)
        'WN': [1, 1], // From top left to bottom right
        'EN': [1, -1] // From top right to bottom left
      },
      row, col; // y, x

    switch (direction) {
      case 'W': // Horizontal (From left to right)
        var row = Math.rangeInt(this.settings.gridSize  - 1),
          col = Math.rangeInt(this.settings.gridSize - word.length);
        break;

      case 'N': // Vertical (From top to bottom)
        var row = Math.rangeInt(this.settings.gridSize - word.length),
          col = Math.rangeInt(this.settings.gridSize  - 1);
        break;

      case 'WN': // From top left to bottom right
        var row = Math.rangeInt(this.settings.gridSize - word.length),
          col = Math.rangeInt(this.settings.gridSize - word.length);
        break;

      case 'EN': // From top right to bottom left
        var row = Math.rangeInt(this.settings.gridSize - word.length),
          col = Math.rangeInt(word.length - 1, this.settings.gridSize - 1);
        break;

      default:
        var error = 'UNKNOWN DIRECTION ' + direction + '!';
        alert(error);
        console.log(error);
        break;
    }

    // Add words to the matrix
    for (var i = 0; i < word.length; i++) {
      var newRow = row + i * directions[direction][0],
        newCol = col + i * directions[direction][1];

      // The letter on the board
      var origin = this.matrix[newRow][newCol].letter;

      if (origin == '.' || origin == word[i]) {
        this.matrix[newRow][newCol].letter = word[i];
      } else {
        itWorked = false;
      }
    }

    return itWorked;
  }

  /**
   * Initialize the application
   */
  WordSeach.prototype.initialize = function() {
    /**
     * Letter matrix
     *
     * param {Array}
     */
    this.matrix = [];

    /**
     * Selection from
     * @Param {Object}
     */
    this.selectFrom = null;

    /**
     * Selected items
     */
    this.selected = [];
	this.initmatrix(this.settings.gridSize);

  }

  /**
   * Fill default items into the matrix
   * @param {Number} size Grid size
   */
  WordSeach.prototype.initmatrix = function(size) {
   var rsize = size;
   var csize = size
   if (this.settings.condition > 2) {
      rsize = 14;
      csize = 11;
   }
    for (var row = 0; row < rsize; row++) {
      for (var col = 0; col < csize; col++) {
        var item = {
          letter: '.', // Default value
          row: row,
          col: col
        }

        if (!this.matrix[row]) {
          this.matrix[row] = [];
        }

        this.matrix[row][col] = item;
      }
    }
  }

  WordSeach.prototype.testmatrix = function(size) {
    var test_matrix = [
	['.','.','.','.','.','.','.','.','.'],
	['.','B','R','O','W','S','E','R','.'],
	['.','.','.','.','.','.','.','.','.']
	];
	for (var row = 0; row<3; row++) {
      for (var col = 0; col < 9; col++) {
	    var item = {
			letter: test_matrix [row][col], // Default value
			row: row,
			col: col
		}
		
		this.matrix[row][col] = item;
	   }
	   }
	   return 1;
  }
  
  WordSeach.prototype.bobmatrix = function(size) {
	
    //for (var row = 0; row < size; row++) {
	//   if (!this.matrix[row]) {
    //      this.matrix[row] = [];
    //    }
	//}
	 	//puzzle 85 from jumbo word puzzle book volume 46, landolls, 1995, ashland, oh
	var control_matrix = [
[	'V', 	'H', 	'W', 	'X', 	'S', 	'C', 	'E', 	'P', 	'T', 	'E', 	'R', 	'C', 	'R', 	'S', 	'P', 	'S', 	'J', 	'T'	],
[	'S', 	'T', 	'T', 	'T', 	'N', 	'X', 	'D', 	'Y', 	'D', 	'X', 	'L', 	'M', 	'W', 	'K', 	'A', 	'O', 	'B', 	'C'	],
[	'G', 	'N', 	'A', 	'R', 	'C', 	'W', 	'O', 	'E', 	'A', 	'Y', 	'T', 	'R', 	'S', 	'V', 	'L', 	'V', 	'G', 	'J'	],
[	'C', 	'T', 	'O', 	'D', 	'O', 	'P', 	'O', 	'F', 	'S', 	'N', 	'N', 	'R', 	'A', 	'H', 	'A', 	'E', 	'G', 	'P'	],
[	'E', 	'O', 	'B', 	'M', 	'R', 	'S', 	'D', 	'R', 	'E', 	'C', 	'O', 	'A', 	'O', 	'E', 	'C', 	'R', 	'I', 	'A'	],
[	'R', 	'I', 	'L', 	'I', 	'M', 	'F', 	'N', 	'M', 	'C', 	'N', 	'E', 	'U', 	'S', 	'K', 	'E', 	'E', 	'P', 	'A'	],
[	'J', 	'E', 	'N', 	'O', 	'A', 	'O', 	'N', 	'O', 	'O', 	'M', 	'S', 	'N', 	'I', 	'T', 	'K', 	'I', 	'U', 	'H'	],
[	'H', 	'C', 	'T', 	'M', 	'N', 	'R', 	'C', 	'H', 	'C', 	'E', 	'O', 	'N', 	'T', 	'N', 	'Y', 	'G', 	'W', 	'L'	],
[	'E', 	'T', 	'I', 	'R', 	'E', 	'Y', 	'H', 	'O', 	'H', 	'M', 	'G', 	'T', 	'I', 	'D', 	'H', 	'N', 	'L', 	'N'	],
[	'H', 	'L', 	'R', 	'V', 	'A', 	'E', 	'T', 	'O', 	'L', 	'D', 	'L', 	'G', 	'S', 	'L', 	'U', 	'I', 	'K', 	'J'	],
[	'Y', 	'T', 	'O', 	'I', 	'A', 	'H', 	'L', 	'I', 	'O', 	'O', 	'H', 	'A', 	'A', 	'U', 	'N', 	'K', 	'V', 	'F'	],
[	'W', 	'G', 	'L', 	'D', 	'B', 	'D', 	'C', 	'M', 	'I', 	'T', 	'R', 	'W', 	'E', 	'E', 	'C', 	'X', 	'E', 	'W'	],
[	'L', 	'A', 	'Y', 	'O', 	'R', 	'B', 	'T', 	'U', 	'K', 	'D', 	'J', 	'D', 	'B', 	'R', 	'T', 	'K', 	'R', 	'A'	],
[	'S', 	'E', 	'A', 	'L', 	'M', 	'U', 	'C', 	'T', 	'W', 	'I', 	'N', 	'D', 	'S', 	'O', 	'R', 	'C', 	'U', 	'C'	],
[	'Z', 	'N', 	'E', 	'T', 	'N', 	'E', 	'M', 	'A', 	'I', 	'L', 	'R', 	'A', 	'P', 	'Z', 	'M', 	'I', 	'L', 	'B'	],
[	'Z', 	'T', 	'H', 	'R', 	'O', 	'N', 	'E', 	'B', 	'P', 	'A', 	'T', 	'R', 	'O', 	'N', 	'A', 	'G', 	'E', 	'W'	],
[	'V', 	'P', 	'K', 	'M', 	'V', 	'G', 	'F', 	'T', 	'R', 	'A', 	'D', 	'I', 	'T', 	'I', 	'O', 	'N', 	'R', 	'Q'	],
[	'O', 	'Z', 	'A', 	'C', 	'G', 	'R', 	'N', 	'T', 	'A', 	'O', 	'Y', 	'D', 	'L', 	'G', 	'X', 	'C', 	'M', 	'C'	]
];

	var impossible_matrix = [
[	'V', 	'H', 	'W', 	'X', 	'S', 	'C', 	'E', 	'P', 	'T', 	'E', 	'R', 	'C', 	'R', 	'S', 	'P', 	'S', 	'J', 	'T'	],
[	'S', 	'T', 	'T', 	'T', 	'N', 	'X', 	'B', 	'Y', 	'D', 	'X', 	'L', 	'M', 	'W', 	'K', 	'A', 	'F', 	'B', 	'C'	],
[	'G', 	'O', 	'A', 	'R', 	'C', 	'W', 	'O', 	'T', 	'A', 	'Y', 	'T', 	'E', 	'S', 	'V', 	'L', 	'O', 	'G', 	'J'	],
[	'C', 	'T', 	'N', 	'D', 	'O', 	'W', 	'O', 	'F', 	'V', 	'N', 	'N', 	'R', 	'G', 	'H', 	'A', 	'D', 	'G', 	'P'	],
[	'E', 	'O', 	'B', 	'F', 	'B', 	'S', 	'D', 	'R', 	'E', 	'C', 	'O', 	'A', 	'O', 	'V', 	'C', 	'T', 	'I', 	'A'	],
[	'R', 	'I', 	'L', 	'J', 	'J', 	'A', 	'N', 	'M', 	'C', 	'N', 	'E', 	'U', 	'S', 	'H', 	'E', 	'E', 	'P', 	'A'	],
[	'J', 	'E', 	'N', 	'O', 	'P', 	'B', 	'U', 	'O', 	'O', 	'M', 	'S', 	'N', 	'N', 	'T', 	'K', 	'I', 	'U', 	'H'	],
[	'H', 	'C', 	'T', 	'S', 	'N', 	'F', 	'W', 	'H', 	'C', 	'E', 	'O', 	'P', 	'T', 	'N', 	'Y', 	'G', 	'W', 	'L'	],
[	'E', 	'T', 	'Y', 	'R', 	'E', 	'Y', 	'H', 	'O', 	'H', 	'M', 	'R', 	'T', 	'I', 	'D', 	'H', 	'N', 	'L', 	'N'	],
[	'H', 	'L', 	'R', 	'P', 	'N', 	'E', 	'T', 	'O', 	'L', 	'X', 	'L', 	'G', 	'S', 	'S', 	'U', 	'I', 	'K', 	'J'	],
[	'Y', 	'T', 	'C', 	'I', 	'A', 	'H', 	'L', 	'I', 	'I', 	'O', 	'H', 	'A', 	'M', 	'U', 	'N', 	'K', 	'V', 	'F'	],
[	'W', 	'S', 	'L', 	'D', 	'B', 	'D', 	'H', 	'M', 	'I', 	'T', 	'R', 	'U', 	'E', 	'E', 	'C', 	'X', 	'E', 	'W'	],
[	'O', 	'T', 	'O', 	'K', 	'I', 	'B', 	'T', 	'U', 	'K', 	'D', 	'J', 	'D', 	'B', 	'R', 	'T', 	'K', 	'R', 	'A'	],
[	'S', 	'E', 	'A', 	'L', 	'M', 	'U', 	'C', 	'T', 	'W', 	'I', 	'N', 	'D', 	'S', 	'O', 	'R', 	'C', 	'U', 	'C'	],
[	'Z', 	'N', 	'E', 	'T', 	'N', 	'E', 	'M', 	'A', 	'I', 	'L', 	'R', 	'A', 	'P', 	'Z', 	'M', 	'I', 	'L', 	'B'	],
[	'Z', 	'T', 	'H', 	'R', 	'O', 	'N', 	'E', 	'B', 	'P', 	'A', 	'T', 	'R', 	'O', 	'N', 	'A', 	'G', 	'E', 	'W'	],
[	'V', 	'P', 	'K', 	'M', 	'V', 	'G', 	'F', 	'T', 	'R', 	'A', 	'D', 	'I', 	'T', 	'I', 	'O', 	'N', 	'R', 	'Q'	],
[	'O', 	'Z', 	'A', 	'C', 	'G', 	'R', 	'N', 	'T', 	'A', 	'O', 	'Y', 	'D', 	'L', 	'G', 	'X', 	'C', 	'M', 	'C'	]
];

	var power_matrix = [
[	'K',	'X',	'N',	'A',	'V',	'K',	'W',	'U',	'D',	'K',	'B'	],
[	'C',	'O',	'F',	'F',	'E',	'E',	'N',	'O',	'E',	'T',	'S'	],
[	'E',	'Y',	'I',	'N',	'F',	'L',	'U',	'E',	'N',	'C',	'E'	],
[	'T',	'X',	'F',	'L',	'J',	'C',	'F',	'N',	'E',	'M',	'X'	],
[	'D',	'X',	'E',	'H',	'O',	'U',	'S',	'E',	'Y',	'W',	'D'	],
[	'A',	'A',	'M',	'C',	'A',	'R',	'I',	'S',	'U',	'R',	'R'	],
[	'O',	'U',	'E',	'M',	'U',	'S',	'T',	'R',	'G',	'L',	'A'	],
[	'S',	'Y',	'T',	'X',	'O',	'T',	'R',	'N',	'S',	'U',	'O'	],
[	'J',	'R',	'E',	'H',	'T',	'M',	'I',	'T',	'O',	'E',	'B'	],
[	'N',	'J',	'E',	'A',	'O',	'D',	'J',	'V',	'G',	'C',	'W'	],
[	'H',	'C',	'I',	'R',	'N',	'R',	'B',	'E',	'E',	'Q',	'G'	],
[	'K',	'C',	'O',	'L',	'C',	'L',	'I',	'O',	'J',	'E',	'K'	],
[	'M',	'U',	'H',	'E',	'C',	'Y',	'O',	'T',	'S',	'W',	'O'	],
[	'X',	'K',	'J',	'K',	'S',	'X',	'Z',	'O',	'Y',	'S',	'Z'	]
];

	var neutral_matrix = [
[	'J',	'O',	'Q',	'L',	'X',	'J',	'V',	'D',	'F',	'Y',	'D'	],
[	'O',	'S',	'N',	'B',	'C',	'G',	'Z',	'R',	'R',	'R',	'R'	],
[	'T',	'P',	'V',	'U',	'L',	'N',	'C',	'K',	'E',	'F',	'A'	],
[	'K',	'L',	'Z',	'J',	'X',	'I',	'L',	'G',	'T',	'C',	'O'	],
[	'Z',	'L',	'B',	'H',	'E',	'D',	'O',	'L',	'A',	'O',	'B'	],
[	'D',	'C',	'E',	'Y',	'N',	'L',	'C',	'U',	'W',	'F',	'F'	],
[	'W',	'Y',	'N',	'V',	'O',	'I',	'K',	'P',	'N',	'F',	'K'	],
[	'E',	'Q',	'I',	'X',	'H',	'U',	'K',	'L',	'H',	'E',	'L'	],
[	'D',	'W',	'Z',	'V',	'P',	'B',	'L',	'P',	'O',	'E',	'A'	],
[	'J',	'F',	'A',	'X',	'E',	'E',	'A',	'M',	'U',	'H',	'M'	],
[	'O',	'C',	'G',	'R',	'L',	'X',	'H',	'H',	'S',	'X',	'P'	],
[	'V',	'W',	'A',	'K',	'E',	'F',	'C',	'O',	'E',	'C',	'K'	],
[	'C',	'G',	'M',	'R',	'T',	'M',	'A',	'F',	'S',	'N',	'H'	],
[	'U',	'F',	'P',	'G',	'B',	'C',	'X',	'T',	'K',	'J',	'J'	]
];

	var csize = size;
	var rsize = size;
	if (this.settings.condition > 2) { 
		csize = 11; 
		rsize = 14;
	}
	
	for (var row = 0; row < rsize; row++) {
      for (var col = 0; col < csize; col++) {
	    if(this.settings.condition == 0) {
			var item = {
			letter: control_matrix [row][col], // Default value
			row: row,
			col: col
			}
		} 
	     if(this.settings.condition == 1) {
			var item = {
			letter: impossible_matrix [row][col], // Default value
			row: row,
			col: col
			}
		}
	     
	     if(this.settings.condition == 4) {
			var item = {
			letter: neutral_matrix [row][col], // Default value
			row: row,
			col: col
			}
		}
		
	     
	     if(this.settings.condition == 5) {
			var item = {
			letter: power_matrix  [row][col], // Default value
			row: row,
			col: col
			}
		}
		
		this.matrix[row][col] = item;
	   }
	}
	return 1;
  }
  
  /**
   * Draw the matrix
   */
  WordSeach.prototype.drawmatrix = function() {
    var rowcount = this.settings.gridSize;
	var columncount = this.settings.gridSize;
	if (this.settings.test) { 
		rowcount = 3; 
		columncount = 9;
	}
	if (this.settings.condition > 2) {
		rowcount = 14;
		columncount = 11;
	}
	
	
    for (var row = 0; row < rowcount; row++) {
      // New row
      var divEl = document.createElement('div');
      divEl.setAttribute('class', 'ws-row');
      this.wrapEl.appendChild(divEl);

      for (var col = 0; col < columncount; col++) {
        var cvEl = document.createElement('canvas');
        cvEl.setAttribute('class', 'ws-col');
        cvEl.setAttribute('width', 25);
        cvEl.setAttribute('height', 25);

        // Fill text in middle center
        var x = cvEl.width / 2,
          y = cvEl.height / 2;

        var ctx = cvEl.getContext('2d');
        ctx.font = '400 18px Calibri';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#333'; // Text color
        ctx.fillText(this.matrix[row][col].letter, x, y);

        // Add event listeners
        cvEl.addEventListener('mousedown', this.onMousedown(this.matrix[row][col]));
        cvEl.addEventListener('mouseover', this.onMouseover(this.matrix[row][col]));
        cvEl.addEventListener('mouseup', this.onMouseup());

        divEl.appendChild(cvEl);
      }
    }
  }

  /**
   * Fill up the remaining items
   */
  WordSeach.prototype.fillUpFools = function() {
    var rsize = this.settings.gridSize;
    var csize = this.settings.gridSize;
    if (this.settings.condition > 2) {
       rsize = 14;
       csize = 11;
    }
    for (var row = 0; row < rsize; row++) {
      for (var col = 0; col < csize; col++) {
        if (this.matrix[row][col].letter == '.') {
          // Math.rangeInt(65, 90) => A ~ Z
          this.matrix[row][col].letter = String.fromCharCode(Math.rangeInt(65, 90));
        }
      }
    }
  }

  /**
   * Returns matrix items
   * @param rowFrom
   * @param colFrom
   * @param rowTo
   * @param colTo
   * @return {Array}
   */
  WordSeach.prototype.getItems = function(rowFrom, colFrom, rowTo, colTo) {
    var items = [];

    if ( rowFrom === rowTo || colFrom === colTo || Math.abs(rowTo - rowFrom) == Math.abs(colTo - colFrom) ) {
      var shiftY = (rowFrom === rowTo) ? 0 : (rowTo > rowFrom) ? 1 : -1,
        shiftX = (colFrom === colTo) ? 0 : (colTo > colFrom) ? 1 : -1,
        row = rowFrom,
        col = colFrom;

      items.push(this.getItem(row, col));
      do {
        row += shiftY;
        col += shiftX;
        items.push(this.getItem(row, col));
      } while( row !== rowTo || col !== colTo );
    }

    return items;
  }

  /**
   * Returns matrix item
   * @param {Number} row
   * @param {Number} col
   * @return {*}
   */
  WordSeach.prototype.getItem = function(row, col) {
    return (this.matrix[row] ? this.matrix[row][col] : undefined);
  }

  /**
   * Clear the exist highlights
   */
  WordSeach.prototype.clearHighlight = function() {
    var selectedEls = document.querySelectorAll('.ws-selected');
    for (var i = 0; i < selectedEls.length; i++) {
      selectedEls[i].classList.remove('ws-selected');
    }
  }

  /**
   * Lookup if the wordlist contains the selected
   * @param {Array} selected
   */
  WordSeach.prototype.lookup = function(selected) {
  
  
    var words = [''];

    for (var i = 0; i < selected.length; i++) {
      words[0] += selected[i].letter;
    }
    words.push(words[0].split('').reverse().join(''));

    if (this.settings.words.indexOf(words[0]) > -1 ||
        this.settings.words.indexOf(words[1]) > -1) {
		
		
		//word has been found -- added this code to keep score - requires score function in bob script
		//also, added to strik found words and to check if already found before adding to score
	  var ele = document.getElementById(words[0])
	  
	  if(document.getElementById(words[0]).getAttribute("text-decoration") == 'none') {
		var currentscore = score();
	  	document.getElementById("score").innerHTML = "Found " + currentscore + " out of " + this.settings.words.length + " words so far.";
		document.getElementById(words[0]).style.setProperty("text-decoration", "line-through");
		document.getElementById(words[0]).setAttribute("text-decoration", "line-through");
	  }
		
	  
      for (var i = 0; i < selected.length; i++) {
        var row = selected[i].row + 1,
          col = selected[i].col + 1,
          el = document.querySelector('.ws-area .ws-row:nth-child(' + row + ') .ws-col:nth-child(' + col + ')');

        el.classList.add('ws-found');
      }
    }
  }

  /**
   * Mouse event - Mouse down
   * @param {Object} item
   */
  WordSeach.prototype.onMousedown = function(item) {
    var _this = this;
    return function() {
      _this.selectFrom = item;
    }
  }

  /**
   * Mouse event - Mouse move
   * @param {Object}
   */
  WordSeach.prototype.onMouseover = function(item) {
    var _this = this;
    return function() {
      if (_this.selectFrom) {
        _this.selected = _this.getItems(_this.selectFrom.row, _this.selectFrom.col, item.row, item.col);

        _this.clearHighlight();

        for (var i = 0; i < _this.selected.length; i ++) {
          var current = _this.selected[i],
            row = current.row + 1,
            col = current.col + 1,
            el = document.querySelector('.ws-area .ws-row:nth-child(' + row + ') .ws-col:nth-child(' + col + ')');

          el.className += ' ws-selected';
        }
      }
    }
  }

  /**
   * Mouse event - Mouse up
   */
  WordSeach.prototype.onMouseup = function() {
    var _this = this;
    return function() {
      _this.selectFrom = null;
      _this.clearHighlight();
      _this.lookup(_this.selected);
      _this.selected = [];
    }
  }

})();