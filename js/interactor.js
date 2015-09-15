//-----------------------------
// Window scroll event handler
//-----------------------------
$.fn.scrollEnd = function(callback, timeout) {
	$(this).scroll(function(){
		var $this = $(this);
		if ($this.data('scrollTimeout')) {
			clearTimeout($this.data('scrollTimeout'));
		}
		$this.data('scrollTimeout', setTimeout(callback,timeout));
	});
};
//-------------------------------------
// Convert jQuery object into a String
//-------------------------------------
$.fn.getHTML= function() {
	return $('<a></a>').append(this.clone()).html();
}
//--------------------------------------
// Filter dialog 'Reset' action handler
//--------------------------------------
function filterResetHandler() {
	var fsHide = $('.filterPanel-hide');
	var fsDoW = $('.filterPanel-dow');
	var fsLevel = $('.filterPanel-level');
	var itName = $('div.filterPanel-container input[type="text"]');

	//-- 'Items to Hide' fieldset
	fsHide.find('input').prop('checked',false);
	//-- 'Days of the week to show' fieldset
	fsDoW.find('input').prop('checked',false);
	fsDoW.find('input[data-val=Any]').trigger('click');
	//-- 'Course levels to show' fieldset
	fsLevel.find('input').prop('checked',false);
	fsLevel.find('input[data-val=Any]').trigger('click');
	//-- Instructor name textinput
	itName.val('');
	return false;
}
//--------------------------------------
// Filter dialog 'Apply' action handler
//--------------------------------------
function filterApplyHandler() {
	//-- Clean up previous settings for 'filter-hidden' and 'filter-shown' classes
	$('.filter-hidden').removeClass('filter-hidden');
	$('.filter-shown').removeClass('filter-shown');
	$('.filter-name-whitelist').removeClass('filter-name-whitelist');
	//-- Handling selected course levels
	var levelItems = $('div.filterPanel-container input[data-type="level-pattern"]:not(:checked)');
	if($('div.filterPanel-container input[data-type="level-any"]').prop('checked') === false) {
		levelItems.each(function(){
			$('.filter-level-' + $(this).attr('data-val').substring(0,1)).addClass('filter-hidden')
		})
	}
	//-- Handling days-of-the-week
	var dowItems = [];
	$('div.filterPanel-container input[data-type="dow-day"]:checked').each(function(){
		dowItems.push($(this).attr('data-val'));
	});
	if($('div.filterPanel-container input[data-type="dow-not"]').prop('checked') === false) {
		if($('div.filterPanel-container input[data-type="dow-any"]').prop('checked') === false) {
			if(dowItems.length > 0) {
				$('.filter-all:not(.filter-genInfo):not(.filter-dow-' + dowItems.join("-") + ')').addClass('filter-hidden');
			}
			else {
				$('.filter-all:not(.filter-genInfo)').addClass('filter-hidden');
			}
		}
	}
	else {
		var dowClasses = localStorage.getItem('sched.dowClasses').split(/\s+/g);
		if($('div.filterPanel-container input[data-type="dow-any"]').prop('checked') === false) {
			for(var classIndex = 0, classTotal = dowClasses.length; classIndex < classTotal; classIndex++) {
				for(var dowIndex = 0, dowTotal = dowItems.length; dowIndex < dowTotal; dowIndex++) {
					if(dowClasses[classIndex].indexOf(dowItems[dowIndex]) > -1) {
						$('.' + dowClasses[classIndex]).addClass('filter-hidden');
						break;
					}
				}
			}
		}
		else {
			$('.filter-all:not(.filter-genInfo)').addClass('filter-hidden');
		}
	}
	//-- Handling 'Name'-filter
	var instName = $('div.filterPanel-container input[name=name-entry]').val().toLowerCase();
	if(instName.length > 0) {
		var nameMap = $('div.filterPanel-container').data('nameMap');
		for(var name in nameMap) {
			if(name.toLowerCase().indexOf(instName) > -1) {
				$(nameMap[name].td).map(function(){
					return this.toArray()
				})
				.parent()
				.addClass('filter-name-whitelist');
			}
		}
		$('.filter-all:not(.filter-name-whitelist):not(.filter-genInfo)').addClass('filter-hidden');
	}
	//-- General info div
	if($('div.filterPanel-genInfo').find('input')[0].checked) {
		$('.filter-genInfo').addClass('filter-hidden');
	}
	//-- Closed sections
	if($('div.filterPanel-closedSection').find('input')[0].checked) {
		$('.filter-closedSection').addClass('filter-hidden');
	}
	//-- Debug info: number of items to be hidden
	if(localStorage.getItem('sched.param(debug)') !== '0') {
		console.log($('.filter-hidden').length + ' / ' +  $('.filter-all:not(.filter-genInfo)').length + ' records hidden.');
	}
	//-- Show all filtered items that don't have .filter-hidden class
	$('.filter-all:not(.filter-hidden)').addClass('filter-shown').show();
	//-- Hide all items that have .filter-hidden class
	$('.filter-hidden').hide();
	//-- Hide all letters in letter-bar
	$('div.navigation-letters').find('table tr:gt(0)').hide();
	//-- Hide empty tables
	$('.filter-allTables table').each(function(index){
		var entriesToHideOrShow = $(this);
		if($(this).find('tr.filter-shown').length === 0) {
			entriesToHideOrShow.hide();
		}
		else {
			entriesToHideOrShow.show();
			$('div.navigation-letters table tr:contains("' + entriesToHideOrShow.prev('a').attr('name') + '")').show();
		}
	});
	//-- Scroll to stored position
	if($(window).data('topRow') !== null) {
		smoothScrollTo($(window).data('topRow').offset().top);
	}
	//-- Trigger windows resize event to re-place naviation letterbar
	$(window).trigger('resize');
	//-- Close dialog
	$('#filterPanel-close').trigger('click');
}

//---------------------------------------
// Event handler for Course Title clicks
//---------------------------------------
function courseTitleClickHandler() {
	var thisRow = $(this).parent().parent();
	var nextRow = thisRow.next();
	var subj = thisRow.data('subj');
	var numb = thisRow.data('numb');
	var anchor = subj + '_' + numb;
	if(nextRow.find('td').length == 1) {
		nextRow
		.toggle('fast')
		.toggleClass(thisRow.attr('class'));
	}
	else {
		var container =
			thisRow
			.after(
				$("<tr>")
				.append(
					$('<td>')
					.attr('colspan', thisRow.find('td').length)
					.addClass('desc-container')
				)
				.addClass(thisRow.attr('class'))
			)
			.next()
			.find('td');
		var keyDesc = "sched.desc(" + anchor + ")";
		if(localStorage.getItem(keyDesc) === null) {
			$.get("raintaker.php?term=" + localStorage.getItem('sched.param(term)') + "&subj=" + subj + "&numb=" + numb, function(data){
				var courseDescContainer = $(data).find("table.datadisplaytable tr td.ntdefault").first();
				if(courseDescContainer.length > 0) {
					var courseDescText = courseDescContainer.contents().filter(function(){
						return this.nodeType === 3;
					})[0].nodeValue;
					var courseDescHTML = '<span>' + ((courseDescText.trim().length > 0) ? courseDescText : 'Not available') + '</span>';
					var coursePrereqHTML = '';
					var currentNode = courseDescContainer.contents().filter(function(){
						return (this.nodeName === 'SPAN') && (this.textContent.indexOf('Prerequisites') > -1);
					})[0];
					if(typeof currentNode !== 'undefined') {
						while(currentNode.nextSibling !== null) {
							if((currentNode.nodeType === 3) && (currentNode.nodeValue !== '\n')) {
								coursePrereqHTML += '<span>' + currentNode.nodeValue + '</span>';
							}
							else if(currentNode.nodeType === 1 && currentNode.nodeName === 'A') {
								var targetParts = currentNode.text.split(' ');
								if(targetParts[0].length > 3)  {
									coursePrereqHTML += '<a href="' + currentNode.href.replace(document.domain,'rain.gsw.edu') + '" target="_blank">' + currentNode.text + '</a>';
								}
								else {
									coursePrereqHTML += '<span class="desc-span-nonclick">' + currentNode.text + '</span>';
								}
							}
							currentNode = currentNode.nextSibling;
						}
					}
					else {
						coursePrereqHTML = '<span>Restrictions may apply. More details can be found <a href="' +
						'https://rain.gsw.edu/prod8x/bwckctlg.p_disp_course_detail?' +
						'cat_term_in=' + localStorage.getItem('sched.param(term)') +
						'&subj_code_in=' + subj +
						'&crse_numb_in=' + numb +
						'" target="_blank">here</a></span>';
					}
					var P1 = '<h3 class="desc-title">Course Description:</h3>' + courseDescHTML;
					var P2 = '<h3 class="desc-title">Course Prerequisites:</h3>' + coursePrereqHTML;
					localStorage.setItem(keyDesc, P1 + '<p>' + P2);
				}
				else {
					localStorage.setItem(keyDesc,'<h3 class="desc-error">Error: cannot access RAIN to retrieve course description</h3>');
				}
				container.append($('<div class="desc-inner">').html(localStorage.getItem(keyDesc)));
			});
		}
		else {
			container.append($('<div class="desc-inner">').html(localStorage.getItem(keyDesc)));
		}
	}
	return false;
}
//-----------------------
// locMap postprocessing
//-----------------------
function locPostProc(loc,buildingData,locMap) {
	if(loc in buildingData) {
		locMap[loc].buildingData = buildingData[loc];
		locMap[loc].locKey = loc;
		if(localStorage.getItem('sched.location(' + loc + ')') === null) {
			$.get('raintaker.php?location',function(data){
				var clearData = data.replace(/[<]img\s+src=["]image\/(directions|car|bike|walk)[.]png["].+\/[>]/gi,'');
				var mapHTML = $($.parseHTML(clearData)).find('div#' + buildingData[loc].maxi + ' div.modal-dialog').each(function(){$(this).find('.modal-header,.modal-footer').remove();})[0].outerHTML;
				localStorage.setItem('sched.location(' + loc + ')',mapHTML);
				updateLocationInfo(locMap[loc],mapHTML,false);
			});
		}
		else {
			updateLocationInfo(locMap[loc],localStorage.getItem('sched.location(' + loc + ')'),true);
		}
	}
}
//------------------------
// nameMap postprocessing
//------------------------
function namePostProc(name, nameMap) {
	var keyName = "sched.name(" + name + ")";
	var lname = name;
	var fname = '';
	if(name.split(',').length > 1) {
		lname = name.split(",")[0].trim();
		fname = name.split(",")[1].trim();
	}
	nameMap[name].lname = lname;
	nameMap[name].name = name;
	if(localStorage.getItem(keyName) === null) {
		$.get('raintaker.php?name=' + lname, function(data){
			var blocks = $(data).find("p");
			if(blocks.length == 1) {
				localStorage.setItem(keyName, getInstructorInfo(blocks));
			}
			else {
				var initialsNotFound = true;
				blocks.each(function(p_index){
					var fullname = $(this).find('b:eq(0)').text().trim();
					var email = $(this).find('a:eq(0)').text().trim();
					var nameparts = fullname.split(" ",4);
					for(var i=0, tot=nameparts.length-1; i<tot; i++) {
						if(nameparts[i].indexOf(fname.substring(0,1)) === 0) {
							localStorage.setItem(keyName, getInstructorInfo($(this)));
							initialsNotFound = false;
							return false;
						}
					}
					if(initialsNotFound === true && email.split('@')[1] === 'gsw.edu' && email.indexOf(fname.substring(0,1).toLowerCase()) === 0) {
						localStorage.setItem(keyName, getInstructorInfo($(this)));
						initialsNotFound = false;
						return false;
					}
				});
				if(initialsNotFound === true) {
					localStorage.setItem(keyName, getInstructorInfo(blocks.first()));
				}
			}
			updateInstructorInfo(nameMap[name], localStorage.getItem(keyName),false);
		});
	}
	else {
		updateInstructorInfo(nameMap[name], localStorage.getItem(keyName),true);
	}
}
//--------------------------------
// Smooth scrolling to 'position'
//--------------------------------
function smoothScrollTo(position) {
	$(document.body).animate({
		scrollTop: position,
		duration: 10
	});
}
//--------------
// Filter panel
//--------------
function getFilterPanel() {
	var filterContent =
	$('<div>')
	.addClass('filterPanel-container')
	.addClass('no-print')
	.append(
		$('<form>')
		.append(
			$('<fieldset>')
			.addClass('filterPanel-hide')
			.append(
				$('<legend>')
				.html('<b>Items to hide</b>')
			)
			.append(
				$('<p>')
				.html('Select which items to hide. <b>Any</b> combination is allowed.')
			)
			.append(
				$('<div>')
				.addClass('filterPanel-genInfo')
				.append(
					$('<input type="checkbox">')
					.attr('name','hideGenInfo')
				)
				.append($('<label>').text('General information'))
				.click(function(){
					var input = $(this).find('input');
					input[0].checked = !(input[0].checked);
				})
			)
			.append(
				$('<div>')
				.addClass('filterPanel-closedSection')
				.append(
					$('<input type="checkbox">')
					.attr('name','hideClosedSection')
				)
				.append($('<label>').text('Closed sections'))
				.click(function(){
					var input = $(this).find('input');
					input[0].checked = !(input[0].checked);
				})
			)
		)
		.append(
			$('<fieldset>')
			.addClass('filterPanel-dow')
			.append(
				$('<legend>')
				.html('<b>Days of the week to show</b>')
			)
			.append(
				$('<p>')
				.html(
					'Make sure to provide <b>exact</b> match for specific days of the week that you\'d like to be shown. ' +
					'Anything that is not <b>explicitely</b> selected will be hidden. ' +
					'<ul>' +
					'<li>Uncheck <b>Any</b> item if you want to select particular days</li>' +
					'<li>Combining <b>Online</b> or <b>U</b> (undetermined) with any other selection will always result in an <b>empty</b> list</li>' +
					'</ul>'
				)
			)
		)
		.append(
			$('<fieldset>')
			.addClass('filterPanel-level')
			.append(
				$('<legend>')
				.html('<b>Course levels to show</b>')
			)
		)
	);
	var level = "0xxx 1xxx 2xxx 3xxx 4xxx 5xxx 6xxx 7xxx 8xxx Any".split(/\s+/gi);
	$.each(level,function(index){
		var levelItem = level[index];
		filterContent
		.find('fieldset.filterPanel-level')
		.append(
			$('<div>')
			.addClass('filterPanel-levelItem level-' + levelItem)
			.append(
				$('<input type="checkbox">')
				.attr('data-val',levelItem)
				.attr('name','level-' + levelItem)
			)
			.append(
				$('<label>')
				.text(levelItem)
			)
		);
	});
	var dow = "M T W R F S U O Any Not".split(/\s+/gi);
	$.each(dow,function(index){
		var day = dow[index];
		var tooltipText = "";
		switch (day) {
			case "U":
				tooltipText = "Undetermined (usually practice or semenar sessions)";
				break;
			case "O":
				tooltipText = "Online, eCore, eMajor";
				break;
			case "Not":
				tooltipText = "Exclusive inversion of the DoW filtering logic. For example, having 'M', 'W', and 'Not' " +
				"selected would result in hiding course offerings associated with 'only Monday', 'only Wednesday', or both";
				break;
		}
		filterContent
		.find('fieldset.filterPanel-dow')
		.append(
			$('<div>')
			.addClass('filterPanel-dowItem dow-' + day)
			.append(
				$('<input type="checkbox">')
				.attr('data-val', day)
				.attr('name','dow-' + day)
			)
			.append($('<label>').text((day === "O") ? "Online" : day))
			.attr('title', tooltipText)
		);
	});
	filterContent
	//-- Day of the week checkboxes
	.find('div.dow-Not').each(function(){
		var input = $(this).find('input');
		input
		.attr('data-type','dow-not')
		.prop('checked', false);
		$(this).click(function(){
			input[0].checked = !(input[0].checked);
		});
	})
	.end()
	.find('div.dow-Any').each(function(){
		var input = $(this).find('input');
		input
		.attr('data-type','dow-any')
		$(this).click(function(){
			input[0].checked = !(input[0].checked);
			$('div.filterPanel-container input[data-type="dow-day"]')
			.prop('disabled',input[0].checked)
			.css('cursor',input[0].checked ? 'not-allowed' : 'default');
		})

	})
	.end()
	.find('div.filterPanel-dowItem:not(div.dow-Any):not(div.dow-Not)').each(function(){
		var input = $(this).find('input');
		input
		.attr('data-type','dow-day')
		//.prop('disabled',true);
		$(this).click(function(){
			if(!$('div.filterPanel-container input[data-type="dow-any"]').prop('checked')) {
				input[0].checked = !(input[0].checked);
			}
		});
	})
	.end()
	// Course level checkboxes
	.find('div.level-Any').each(function(){
		var input = $(this).find('input');
		input
		.attr('data-type','level-any')
		$(this).click(function(){
			input[0].checked = !(input[0].checked);
			$('div.filterPanel-container input[data-type="level-pattern"]')
			.prop('disabled',input[0].checked)
			.css('cursor',input[0].checked ? 'not-allowed' : 'default');
		});
	})
	.end()
	.find('div.filterPanel-levelItem:not(div.level-Any)').each(function(){
		var input = $(this).find('input');
		input
		.attr('data-type','level-pattern')
		$(this).click(function(){
			if(!$('div.filterPanel-container input[data-type="level-any"]').prop('checked')) {
				input[0].checked = !(input[0].checked);
			}
		});
	})
	.end()
	// Instructor name filter
	.append(
		$('<input>')
		.attr({
			'type' :  			'text',
			'name' :  			'name-entry',
			'title' : 			'Enter a part of or entire last name of instructor(s) to limit list of displayed classes. Exact match can be made ' +
									'by using combination of the last name along with initial as listed in corresponding table column, e.g. \'Doe, J\'',
			'placeholder' : 	'Last name of the instructor to filter'
		})
	)
	.append(
		$('<button>')
		.attr('id','filterPanel-close')
		.text('Close')
		.click(function(e){
			$('div.filterPanel-container').hide();
			$('#container').removeClass('blur');
		})
	)
	.append(
		$('<button>')
		.attr('id','filterPanel-apply')
		.text('Apply')
		.click(filterApplyHandler)
	)
	.append(
		$('<button>')
		.attr('id','filterPanel-reset')
		.text('Reset')
		.click(filterResetHandler)
	)
	.find('input').click(function(e){
		this.checked = !(this.checked);
	})
	.end()
	.hide();

	return filterContent;
}
//-----------------------------
// Navigation bar with letters
//-----------------------------
function getLetterBar() {
	var alphabet = "# A B C D E F G H I J K L M N O P Q R S T U V W X Y Z".split(/\s+/gi);
	//-- Create a "letterBar" container and append "table" element into it
	var letterBar =
		$('<div>')
		.addClass('navigation-letters')
		.addClass('no-print')
		.append(
			$('<table>')
		)
	//-- For each letter from the "alphabet" add a _hidden_ "tr" into letterBar table with a link to anchor
	$.each(alphabet, function(letter) {
		letterBar
		.find('table')
		.append(
			$('<tr>')
			.append(
				$('<td align="center">')
				.append(
					$('<a>')
					.attr('href','#' + alphabet[letter])
					.text(alphabet[letter])
					.prop('disabled',true)
				)
			)
			.hide()
		);
	});
	//-- Customize "#" link to point to top of the page anchor
	letterBar
	.find('table tr:eq(0)')
	.show()
	.find('a').attr({
		'href' : '#',
		'title' : 'Top of the page'
	})
	if(getDeviceType() === 'phone') {
		letterBar.css('font-size','90%');
	}
	return letterBar;
}
//--------------------------------------------------
//	Extract, format, and return "general info" block
//--------------------------------------------------
function getGenInfo(rawData) {
	//-- Links to external resources
	var genInfoLinks = '';
	rawData.find('center a').each(function(){
		genInfoLinks += $(this)[0].outerHTML + '|';
	});
	genInfoLinks = genInfoLinks.substr(0,genInfoLinks.length-1).replace(/[|]/g,'<span>&nbsp;|&nbsp;</span>');
	var genInfoTitle =
		rawData
		.find('table:eq(1) tbody tr:eq(0) td:eq(0)')
		.text()
		.trim();
	var genInfoFeePayment =
		rawData
		.find('table:eq(2) a');
	var genInfoNotice =
		rawData
		.find('table:eq(3) tr:eq(0) td:eq(0)');
	var genInfoPTRMTitle =
		rawData
		.find('center')
		.siblings('b');
	var genInfoPTRMTable =
		rawData
		.find('table:eq(4)')
		.addClass('genInfo-ptrm')
		.find('td,th')
		.each(function(){
			$(this).find('br').remove();
		})
		.end();
	var genInfoPlagiarism =
		rawData
		.find('table:eq(5) tr:eq(0) td:eq(0)')
		.find('hr')
		.remove()
		.end();
	var refreshDataLink =
		$('<a>')
		.attr({
			'href' : '#',
			'id' : 'refreshLink'
		})
		.addClass('no-print')
		.text('Refresh interactive content')
		.click(function(){
			localStorage.clear();
			location.reload();
			return false;
		})
	var result =
	$('<div>')
	.addClass('filter-genInfo filter-all filter-shown genInfo-container')
	.addClass('no-print')
	.append(
		refreshDataLink
	)
	.append(
		rawData.find('h2')
	)
	.append(
		rawData.find('table:eq(0)')
	)
	.append(
		$('<div>')
		.addClass('genInfo-title')
		.append(
			$('<center>')
			.html(genInfoTitle)
		)
	)
	.append(
		$('<p>')
		.addClass('genInfo-fee')
		.append(genInfoFeePayment)
	)
	.append(
		$('<div>')
		.addClass('genInfo-notice')
		.append(
			genInfoNotice.html()
		)
	)
	.append(
		$('<div>')
		.addClass('genInfo-links')
		.append(
			$('<center>')
			.html(genInfoLinks)
		)
	)
	.append(
		$('<p>')
		.addClass('genInfo-ptrm-title')
		.append(genInfoPTRMTitle.html())
	)
	.append(
		genInfoPTRMTable
		.addClass('genInfo-ptrm-table')
	)
	.append(
		$('<div>')
		.addClass('genInfo-plagiarism')
		.append(
			genInfoPlagiarism.html()
		)
	)
	.find('a')
	.attr('target','_blank')
	.end();
	return result;
}
//-------------------------------------------------
// Extract course listing tables from original DOM
//-------------------------------------------------
function getAllTables(rawData) {
	var result =
		$('<div>')
		.addClass('filter-allTables')
		.append(
			rawData.find('font font > table')
		);
	return result;
}
//------------------------------------------------------------------------------------------------------
// Returns HTML code of the Instructor Infor container retrieved from user directory
//------------------------------------------------------------------------------------------------------
function getInstructorInfo(container) {
	return container.html();
}
//----------------------------------------------------------------------------------------
// Process location map data to add HTML tooltip for records associated with this location
//----------------------------------------------------------------------------------------
function updateLocationInfo(locMap, mapHTML, foundLocal) {
	for(var tdIndex=0, tc = locMap.td.length; tdIndex < tc; tdIndex++) {
		var locText = locMap.td[tdIndex].text().trim().split(/\s+/);
		locMap
		.td[tdIndex]
		.empty()
		.addClass('td-tooltip')
		.append(
			$('<span>')
			.text((locText.length > 1) ? ' ' + locText[1] : '')
		)
	}
	var a =
		$('<a>')
		.attr('href','')
		.click(function(){
			if($('#container').hasClass('blur')) {
				return false;
			}
			var clickElement = $(this);
			//-- Create tooltip container if does not exist
			if($('div.tooltip-container').length === 0) {
				$('#topOfThePage')
				.after(
					$('<div>')
					.addClass('tooltip-container')
					.addClass('no-print')
					.click(function(){
						$(this).remove();
					})
				)
			}
			//-- Make sure content is loaded
			var toolTipContainer =
				$('div.tooltip-container')
				.html(
					$(mapHTML)
					.find('img:last')
					.on('load',function(){
						if(isMobile()) {
							toolTipContainer
							.css({
								'left' : ($(window).width() - toolTipContainer.width())/2,
								'top' :  ($(window).height() - toolTipContainer.height())/2 + $(window).scrollTop()
							});
						}
						else {
							toolTipContainer
							.css({
								'top' :  clickElement.offset().top - toolTipContainer.height(),
								'left' : clickElement.offset().left - toolTipContainer.width()
							});
						}
					})
					.end()
				)
				.css({
					'position' : 'absolute'
				})
			return false;
		})
		.text(locMap.locKey)
		.prependTo(locMap.td)
}
//------------------------------------------------------------------------------------------------
// Process instructor nameMap to add HTML tooltip to every record associated with this instructor
//------------------------------------------------------------------------------------------------
function updateInstructorInfo(nameMap, text, foundLocal) {

	var tdIndexInstructor = nameMap.tdIndexInstructor;
	var lname = nameMap.lname;
	var name = nameMap.name;

	if(text.indexOf('No results were found') > -1) {
		for(var tdIndex=0, tc = nameMap.td.length; tdIndex < tc; tdIndex++) {
			nameMap
			.td[tdIndex]
			.attr('title','No record found in the directory')
		}
		if(localStorage.getItem('sched.param(debug)') !== '0') {
			console.log('Employee directory has no record for \'' + lname + '\'');
		}
	}
	else {
		for(var tdIndex=0, tc = nameMap.td.length; tdIndex < tc; tdIndex++) {
			nameMap
			.td[tdIndex]
			.addClass('td-tooltip')
			.empty();
		}
		var tipContent =
			$('<div>')
			.addClass('name-tooltip')
			.append(text)
			.append(
				$('<span>')
				.html(
					'<br><br>See all employees having last name starting with \'' +
					'<a href="https://gsw.edu/searchDirectory/employee/search.php?name=' + lname + '" ' +
					'target="_blank">' + lname + '</a>\''
				)
			);
		var a = $('<a>')
			.attr('href','')
			.click(function(){
				if($('#container').hasClass('blur')) {
					return false;
				}
				var clickElement = $(this);
				//-- Create tooltip container if does not exist
				if($('div.tooltip-container').length === 0) {
					$('#topOfThePage')
					.after(
						$('<div>')
						.addClass('tooltip-container')
						.addClass('no-print')
						.click(function(){
							$(this).remove();
						})
					)
				}
				var toolTipContainer =
					$('div.tooltip-container')
					.html(tipContent)
					.css({
						'position' : 'absolute'
					})
				if(isMobile()) {
					toolTipContainer
					.css({
						'left' : ($(window).width() - toolTipContainer.width())/2,
						'top' :  ($(window).height() - toolTipContainer.height())/2 + $(window).scrollTop()
					});
				}
				else {
					toolTipContainer
					.css({
						'top' :  clickElement.offset().top - toolTipContainer.height(),
						'left' : clickElement.offset().left - toolTipContainer.width()
					});
				}
				return false;
			})
			.text(name)
			.appendTo(nameMap.td);
	}
}
//-------------------------------------------------------------------------------
// Process data returned from legacy schedule page without binding it to the DOM
//-------------------------------------------------------------------------------
function scheduleProcessor(data) {
	//-- Create "rawData" object by fixing "img" sources in returned schedule markup
	var rawData =
		$('<div>')
		.attr('id','rawData')
		.append(
			$(data)
			.find('img')
			.each(function(){
				var temp = $(this).attr('src');
				$(this).attr('src', 'https://rain.gsw.edu/' + temp);
			})
			.end()
		)
	if(rawData.children().length > 2) {
		rawData
		.find('title:eq(0)')
		.after(
			$('<font face="arial">')
			.append(
				rawData.find('title').nextAll().detach()
			)
		);
	}
	//-- Extract "General Info" object from rawData
	var genInfoObject = getGenInfo(rawData);
	//-- Extract "table data" object
	var allTablesObject = getAllTables(rawData);
	//-- Create "LetterBar"
	var letterBar = getLetterBar();
	//-- Create "Filter Panel"
	var filterPanel = getFilterPanel();
	//-- Create "Filter Button" to be used to open filter panel
	var filterButton =
		$('<div>')
		.attr('id','filterButton')
		.addClass('no-print')
		.text('Filter')
		.click(function(e){
			$('div.filterPanel-container')
			.css({
				'left' : ($(window).width() - $('div.filterPanel-container').width())/2,
				'top' : isMobile() ? 0 : $('#filterButton').outerHeight() + 10
			})
			.toggle();
			$('#container').toggleClass('blur');
			$('div.tooltip-container').remove();
		})
	//-- Initialize maps for instructor names and locations
	var nameMap = {};
	var locMap = {};
	var dowClasses = [];
	//-- Initialize xxhash engine
	var H = XXH(0xABCD);
	//-- Iterate through tables
	allTablesObject
	.find('table')
	.each(function(table_index){
		var thisTable =
			$(this)
			.removeAttr('style')
			.removeAttr('width')
			.removeAttr('cellpadding')
			.removeAttr('cellspacing');
		var thisTableHash = H.update(thisTable.html()).digest().toString();
		if(localStorage.getItem('sched.tables(' + thisTableHash + ')') === null) {
			//-- Skip certain tables if needed (!== 12 for 'T')
			//if(table_index !== 12) {
			if(table_index < 0) {
				return true;
			}
			//-- Remove HTML attributes from TD and TH
			thisTable.find('th,td').removeAttr('valign').removeAttr('width').removeAttr('align');
			//-- Discover table layout to find indeces of 'td' where course description and instructor name are stored
			var firstRow = thisTable.find('tr:eq(0)');
			var tdIndexStatus = 0;
			firstRow.find('th:eq(0)').addClass('col-status');
			var tdIndexCRN = firstRow.find('th:contains("CRN")').addClass('col-crn').index();
			var tdIndexSubj = firstRow.find('th:contains("SUBJ")').addClass('col-subj').index();
			var tdIndexNumb = firstRow.find('th:contains("NO.")').addClass('col-numb').index();
			var tdIndexTitle = firstRow.find('th:contains("TITLE")').addClass('col-title').index();
			var tdIndexPTRM = firstRow.find('th:contains("PTRM")').addClass('col-ptrm').index();
			var tdIndexCredHours = firstRow.find('th:contains("CRED")').addClass('col-hours').index();
			var tdIndexSeatsAvail = firstRow.find('th:contains("AVAIL")').addClass('col-avail').index();
			var tdIndexTotalSeats = firstRow.find('th:contains("TOTAL")').addClass('col-total').index();
			var tdIndexDays = firstRow.find('th:contains("DAYS")').addClass('col-days').index();
			var tdIndexTime = firstRow.find('th:contains("TIME")').addClass('col-time').index();
			var tdIndexLoc = firstRow.find('th:contains("LOCATION")').addClass('col-location').index();
			var tdIndexInstructor = firstRow.find('th:contains("INSTRUCTOR")').addClass('col-instructor').index();
			firstRow.find('th:last-of-type').addClass('col-offering');
			//-- Identiy 'first letter' of listed courses and add hidden anchor just before the table for navigation purposes
			var tableLetter = thisTable.find('tr:eq(1) td:eq(' + tdIndexSubj + ')').text().trim().substring(0,1);
			thisTable
			.before(
				$('<a>')
				.attr({
					'href':'',
					'name':tableLetter
				})
			);
			letterBar.find('table tr').each(function(){
				if($(this).find('td:eq(0) a').text() === tableLetter) {
					$(this).show();
				}
			});
			//-- Identify and mark header columns to be hidden in mobile view
			firstRow.find('th:eq(' + tdIndexPTRM + '),th:eq(' + tdIndexCredHours + '),th:eq(' + tdIndexTotalSeats + '),th:last-of-type').addClass('filter-antimobile');
			//-- Iterate through all table rows
			thisTable.find("tr:gt(0)").each(function(tr_index){
				var thisRow = $(this);
				var nextRow = thisRow.next();
				var thisRowCells = thisRow.find('td');
				var nextRowCells = nextRow.find('td');
				thisRow
				.find('td:eq(' + tdIndexPTRM + '),td:eq(' + tdIndexCredHours + '),td:eq(' + tdIndexTotalSeats + '),td:last-of-type')
				.addClass('filter-antimobile');
				var days = thisRowCells[tdIndexDays].textContent.trim().replace(/\s+/gi,'').split("").join("-");
				var subj = thisRowCells[tdIndexSubj].textContent.trim();
				var numb = thisRowCells[tdIndexNumb].textContent.trim();
				var desc = thisRowCells[tdIndexTitle].textContent.trim();
				var CRN =  thisRowCells[tdIndexCRN].textContent.trim();
				//-- Conditionally assign classes that will be used for filtering
				thisRow.addClass('filter-all filter-shown');
				//-- Day of the week
				var dowClass = '';
				if(days !== '') {
					dowClass = 'filter-dow-' + days;
				}
				else {
					if(thisRow.find('td').last().text().trim().toLowerCase().match(/online|ecore|emajor/) !== null) {
						dowClass = 'filter-dow-O';
					}
					else {
						dowClass = 'filter-dow-U';
					}
				}
				if(dowClass.length > 0) {
					thisRow.addClass(dowClass);
					thisRow.attr('data-dow',dowClass);
					if(dowClasses.indexOf(dowClass) === -1) {
						dowClasses.push(dowClass);
					}
				}
				//-- Course level, i.e. 1xxx, 2xxx, etc
				if(numb.length > 0) {
					thisRow.addClass('filter-level-' + numb.substring(0,1));
				}
				//-- Closed section
				if(thisRowCells[tdIndexStatus].textContent.trim() === 'C') {
					thisRow.addClass('filter-closedSection');
				}
				//-- Assign course title for lab sessions without CRN and copy 'parent' classes
				if(nextRowCells.length && nextRowCells[tdIndexSubj].textContent.trim() === '') {
					nextRowCells[tdIndexTitle].textContent = 'Lab session for \'' + subj + ' ' + numb + '\' (CRN:' + CRN + ')';
					var thisRowClasses = thisRow.attr('class').split(/\s+/gi);
					$.each(thisRowClasses, function(index) {
						var cl = thisRowClasses[index];
						if(cl.indexOf('filter-dow') > -1) {
							return true;
						}
						nextRow.addClass(cl);
					})
				}
				//-- Process good looking 'subject' entries
				if(subj.length >= 3) {
					var anchor = subj + '_' + numb;
					thisRow
					.data('subj',subj)
					.data('numb',numb)
					.attr({
						'href' : '#'+anchor,
						'name' : anchor,
						'data-crn' : CRN
					})
					.find("td:eq(" + tdIndexTitle + ")")
					.empty()
					.append(
						$('<a href="#">')
						.text(desc)
						.click(courseTitleClickHandler)
					);
				}
				//-- Location pre-processing
				var tdLoc = thisRow.find("td:eq(" + tdIndexLoc + ")");
				var loc = tdLoc.text().trim().split(" ")[0];
				if(!(loc in locMap)) {
					locMap[loc] = {};
					locMap[loc].td = [];
				}
				locMap[loc].td.push(tdLoc);
				//-- Instructor name pre-processing
				var tdName = thisRow.find("td:eq(" + tdIndexInstructor + ")");
				var name = tdName.text().trim();
				if(!(name in nameMap)) {
					nameMap[name] = {};
					nameMap[name].td = [];
				}
				nameMap[name].td.push(tdName);
			});
			localStorage.setItem('sched.tables(' + thisTableHash + ')',thisTable.html());
			if(localStorage.getItem('sched.param(debug)') !== '0') {
				console.log('Hash value of \'' + tableLetter + '\'-table has changed');
			}
		}
		else {
			thisTable.html(localStorage.getItem('sched.tables(' + thisTableHash + ')'));
			//-- Discover table layout to find indeces of 'td' where course description and instructor name are stored
			var firstRow = thisTable.find('tr:eq(0)');
			var tdIndexSubj = firstRow.find('th:contains("SUBJ")').index();
			var tdIndexNumb = firstRow.find('th:contains("NO.")').index();
			var tdIndexTitle = firstRow.find('th:contains("TITLE")').index();
			var tdIndexLoc = firstRow.find('th:contains("LOCATION")').index();
			var tdIndexInstructor = firstRow.find('th:contains("INSTRUCTOR")').index();
			//-- Identiy 'first letter' of listed courses and add hidden anchor just before the table for navigation purposes
			var tableLetter = thisTable.find('tr:eq(1) td:eq(' + tdIndexSubj + ')').text().trim().substring(0,1);
			thisTable
			.before(
				$('<a>')
				.attr({
					'href':'',
					'name':tableLetter
				})
			);
			letterBar.find('table tr').each(function(){
				if($(this).find('td:eq(0) a').text() === tableLetter) {
					$(this).show();
				}
			});
			//-- Iterate through all table rows
			thisTable.find("tr:gt(0)").each(function(tr_index){
				var thisRow = $(this)
				var thisRowCells = thisRow.find('td');
				thisRow
				.data('subj',thisRowCells[tdIndexSubj].textContent.trim())
				.data('numb',thisRowCells[tdIndexNumb].textContent.trim())
				.find('td:eq(' + tdIndexTitle + ') a')
				.click(courseTitleClickHandler)
				//-- dowClasses
				var dowClass = thisRow.attr('data-dow');
				if(dowClasses.indexOf(dowClass) === -1) {
					dowClasses.push(dowClass);
				}
				//-- Location pre-processing
				var tdLoc = thisRow.find("td:eq(" + tdIndexLoc + ")");
				var loc = tdLoc.text().trim().split(" ")[0];
				if(!(loc in locMap)) {
					locMap[loc] = {};
					locMap[loc].td = [];
				}
				locMap[loc].td.push(tdLoc);
				//-- Instructor name pre-processing
				var tdName = thisRow.find("td:eq(" + tdIndexInstructor + ")");
				var name = tdName.text().trim();
				if(!(name in nameMap)) {
					nameMap[name] = {};
					nameMap[name].td = [];
				}
				nameMap[name].td.push(tdName);
			})
		}
	});
	localStorage.setItem('sched.dowClasses',dowClasses.join(' '));
	//-- Location post-processing
	var buildingData = getBuildingData();
	for(var key in locMap) {
		locPostProc(key, buildingData, locMap);
	}
	//-- Instructor name post-processing
	for(var key in nameMap) {
		namePostProc(key, nameMap);
	}
	//-- Store nameMap to be used for instructor-name-based filtering
	filterPanel.data('nameMap',nameMap);
	//-- Attach objects to DOM
	$('<div>')
	.attr('id','container')
	.append(filterButton)
	.append(filterPanel)
	.append(letterBar)
	.append(genInfoObject)
	.append(allTablesObject)
	.insertAfter('#topOfThePage');
	//-- Reset setting in filter panel
	filterResetHandler();
	//-- Scroll to URL anchor (if defined)
	if(window.location.hash !== "") {
		var urlTarget = window.location.hash.split('#')[1];
		if(urlTarget.match('^[0-9]{4}$') !== null) {
			if($('tr[data-crn=' + urlTarget + ']').length > 0) {
				$(window).scrollTop($('tr[data-crn=' + urlTarget + ']').offset().top);
			}
		}
		else if(urlTarget.match('^[A-Z]{2,4}_[0-9]{1,4}[ABCLHJWMXK]?$') !== null) {
			if($('tr[name=' + urlTarget + ']').length > 0) {
				$(window).scrollTop($('tr[name=' + urlTarget + ']:eq(0)').offset().top);
			}
		}
		else if(urlTarget.match('^[A-Z]$') !== null) {
			if($('a[name=' + urlTarget + ']:eq(0)').length > 0) {
				$(window).scrollTop($('a[name=' + urlTarget + ']:eq(0)').offset().top);
			}
		}
	}
	$(window).scrollEnd(function(){
		var winTop = $(window).scrollTop();
		var scrollDomain = $('.filter-shown:not(.filter-genInfo)');
		if(scrollDomain.first().length > 0 && (scrollDomain.first().offset().top - winTop > 20)) {
			$(window).data('topRow',null);
			return;
		}
		var $prev = null;
		scrollDomain.each(function(index){
			var distToThis = $(this).offset().top - winTop; //-- positive value if $(this) is fully visible on window
			var distToPrev = ($prev === null) ? -100 : $prev.offset().top - winTop;
			if(distToThis > 0 && distToPrev < 0) {
				$(window).data('topRow', (Math.abs(distToThis) < Math.abs(distToPrev)) ? $(this) : $prev);
				return false;
			}
			$prev = $(this);
		});
	},1000);
	$('#filterButton').repeat(1000).toggleClass('stateA').wait(100).toggleClass('stateA');
}
$(window).resize(function(){
	$('.navigation-letters').css({
		'left': '0px',
		'top':($(window).height() - $('.navigation-letters').height())/2
	});
	$('#filterButton')
	.css({
		'top' : '0px',
		'left':$(window).width()/2-$('#filterButton').width()/2,'top':'auto'
	});
	$('div.filterPanel-container')
	.css({
		'left' : ($(window).width() - $('div.filterPanel-container').width())/2,
		'top' : isMobile() ? 0 : $('#filterButton').outerHeight() + 20
	});
});
$(document).keydown(function(e){
	var code = e.keyCode ? e.keyCode : e.which;
	var filterPanel = $('.filterPanel-container');

	if(code === 27) {
		$('.tooltip-container').remove();
	}
	if(filterPanel.filter(':hidden').length === 0) {
		if(code === 27) {
			filterPanel.hide();
			$("#container").removeClass('blur');
		}
		else if(code === 13) {
			$('#filterPanel-apply').trigger('click');
		}
	}
});
$(window).load(function(){
	//-- Version control
	var version = getVersion();
	if(localStorage.getItem('sched.param(version)') !== version) {
		localStorage.clear();
		console.log('Local storage cleared');
	}
	localStorage.setItem('sched.param(version)', version);
	//-- Debug flag: if enabled via GET ver=1
	localStorage.setItem('sched.param(debug)', getDebug());
	//-- Strore schedule term in localStorage
	localStorage.setItem('sched.param(term)', getTerm().replace(/[^0-9]/g,''));
	//-- Load data from RAIN schedule
	$(window).data('topRow',null);
	$.get('raintaker.php?schedterm=' + getTerm(), function(data){
		scheduleProcessor(data);
		$(window).trigger('resize');
	});
});
