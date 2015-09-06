//-- Extract and format general info block
function extractGenInfo(rawData) {
	//-- Links to external resources
	var genInfoLinks = '';
	rawData.find('center a').each(function(){
		genInfoLinks += $(this)[0].outerHTML + '|';
	});
	genInfoLinks = genInfoLinks.substr(0,genInfoLinks.length-1).replace(/[|]/g,'<span>&nbsp;|&nbsp;</span>');
	var genInfoTitle = rawData.find('table:eq(1) tbody tr:eq(0) td:eq(0)').text().trim();
	var genInfoFeePayment = rawData.find('table:eq(2) a');
	var genInfoNotice = rawData.find('table:eq(3) tr:eq(0) td:eq(0)');
	var genInfoPTRMTitle = rawData.find('center').siblings('b');
	var genInfoPTRMTable = rawData.find('table:eq(4)').addClass('genInfo-ptrm').find('td,th').each(function(){
		$(this).find('br').remove();
	}).end();
	var genInfoPlagiarism = rawData.find('table:eq(5) tr:eq(0) td:eq(0)').find('hr').remove().end();

	var result = $('<div>').addClass('filter-genInfo filter-all filter-shown genInfo-container');
	result
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
	);
	result.find('a').attr('target','_blank');
	return result;
}
//-- Extract course listing tables from original DOM
function extractAllTables(rawData) {
	var result = $('<div>').addClass('filter-allTables');
	result
	.append(
		rawData.find('font font > table')
	);
	return result;
}
//-- Window scroll event handler
$.fn.scrollEnd = function(callback, timeout) {
	$(this).scroll(function(){
		var $this = $(this);
		if ($this.data('scrollTimeout')) {
			clearTimeout($this.data('scrollTimeout'));
		}
		$this.data('scrollTimeout', setTimeout(callback,timeout));
	});
};
//-- Smooth scrolling to 'position'
function smoothScrollTo(position) {
	$(document.body).animate({
		scrollTop: position,
		duration: 10
	});
}
function getInstructorInfo(container) {
	if(localStorage.getItem('sched.param(mini)') === '0') {
		return container.html();
	}
	else {
		var title = container.find('b:eq(0)').text().trim();
		var email = container.find('a:eq(0)').text().trim();
		var phone = container.find('a:eq(1)').text().trim();		container.find('a').remove();
		container.find('b').remove();
		var info = container.text().trim();
		return (title + '\n' + email + '\n' + info + '\n' + phone).trim();
	}
}
function updateLocationInfo(locMap,mapHTML,foundLocal) {
	var mini = localStorage.getItem('sched.param(mini)');
	for(var tdIndex=0, tc = locMap.td.length; tdIndex < tc; tdIndex++) {
		var locText = locMap.td[tdIndex].text().trim().split(/\s+/);
		locMap.td[tdIndex].empty().addClass('td-tooltip').append($('<a>').attr('href','#').click(function(){return false;}).text(locText[0]));
		if(locText.length > 1) {
			locMap.td[tdIndex].find('a').after($('<span>').text(' ' + locText[1]));
		}
		if(mini === '0') {
			locMap.td[tdIndex].find('a').addClass('tooltip').tooltipster({
				content: $(mapHTML),
				theme: 'tooltipster-light',
				interactive: true,
				delay: 0,
				arrow : false,
				onlyOne: true,
				trigger: 'click',
				autoClose: true,
				functionReady: function(origin,tooltip){
					var tt = $(tooltip);
					if(isMobile()) {
						tt
						.css({
							'left' : ($(window).width() - tt.width())/2,
							'top' :  ($(window).height() - tt.height())/2 + $(window).scrollTop()
						});
					}
					tt
					.css({
						'background' : 'transparent',
						'border':'none',
						'padding':'0px 0px'
					})
					.click(function(){
						$('.tooltip').tooltipster('hide');
					})
					.find('.tooltipster-content').css({'padding':'0px'});
				}
			});
		}
		else {
			locMap.td[tdIndex].find('a').attr('title',locMap.buildingData.mini);
		}
	}
}
function updateInstructorInfo(nameMap, text, foundLocal) {
	var mini = localStorage.getItem('sched.param(mini)');
	var tdIndexInstructor = nameMap.tdIndexInstructor;
	var lname = nameMap.lname;
	var name = nameMap.name;
	for(var tdIndex=0, tc = nameMap.td.length; tdIndex < tc; tdIndex++) {
		var td = nameMap.td[tdIndex];
		if(text.indexOf('No results were found') === -1) {
			var a = $('<a>')
			.attr({
				'href' : 'https://gsw.edu/searchDirectory/employee/search.php?name=' + lname,
				'target' : '_blank'
			});
			if(mini === '0') {
				var tipContenet =	$('<div>')
				.append(text)
				.append(
					$('<span>')
					.html('<br><br>See other employee(s) with last name \'' + a.text(lname)[0].outerHTML + '\'')
				);
				td
				.empty()
				.addClass('td-tooltip')
				.append(
					$('<a>')
					.attr('href','#')
					.click(function(){
						return false;
					})
					.text(name)
					.addClass('tooltip')
					.tooltipster({
						content: tipContenet,
						trigger: 'click',
						theme: 'tooltipster-light',
						arrow: false,
						interactive: true,
						functionReady: function(origin,tooltip){
							var tt = $(tooltip);
							if(isMobile()) {
								tt
								.css({
									'left' : ($(window).width() - tt.width())/2,
									'top' :  ($(window).height() - tt.height())/2 + $(window).scrollTop()
								});
							}
							tt.click(function(){
								$('.tooltip').tooltipster('hide');
							});
						}
					})
				);
			}
			else {
				td
				.empty()
				.append(
					a
					.attr('title',text)
					.text(name)
				);
			}
		}
		else {
			td.attr('title','No record found in the directory');
			if(mini === '0') {
				td.addClass('tooltip').tooltipster({theme: 'tooltipster-light'});
			}
			if(localStorage.getItem('sched.param(debug)') !== '0') {
				console.log('Employee directory has no record for \'' + lname + '\'');
			}
		}
	}
}
function scheduleProcessor(data) {
	var rawData = $('<div>')
	.attr('id','rawData')
	.append(
		$(data).find('img').each(function(){
			var temp = $(this).attr('src');
			$(this).attr('src', 'https://rain.gsw.edu/' + temp);
		})
		.end()
	);
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
	//-- Add data refresh link
	$('#topOfThePage')
	.after(
		$('<a>')
		.attr({
			'href' : '#',
			'id' : 'refreshLink'
		})
		.text('Refresh interactive content')
		.click(function(){
			localStorage.clear();
			location.reload();
			return false;
		})
	)
	.next()
	.after(
		extractGenInfo(rawData)
	)
	.next()
	.after(
		extractAllTables(rawData)
	);
	//-- Generate filter button from menuButton div and filter dialog
	var filterContent = $('<div>').addClass('filterPanel-container');
	filterContent
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
				.html('Select which items to show/hide. <b>Any</b> combination is allowed.')
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
					'<li>Uncheck <b>Any</b> item if you need to choose select particular days</li>' +
					'<li>Combining <b>Online</b> or <b>U</b> (undetermined) with any other selection will always result in an <b>empty</b> list</li>' +
					'</ul>'
				)
			)
		)
	);
	var dow = "M T W R F S U O Any".split(/\s+/gi);
	$.each(dow,function(index){
		var day = dow[index];
		filterContent.find('fieldset.filterPanel-dow')
		.append(
			$('<div>')
			.addClass('filterPanel-dowItem dow-' + day)
			.append(
				$('<input type="checkbox">')
				.attr('data-val',day)
				.attr('name','dow-' + day)
			)
			.append($('<label>').text((day === "O") ? "Online" : day))
			.attr('title',(day === "U") ? "Undetermined (usually practice or semenar sessions)" : ((day === "O") ? "Online, eCore, eMajor" : ""))
		);
	});
	filterContent
	.find('div.dow-Any').each(function(){
		var input = $(this).find('input');
		input
		.attr('data-type','dow-any')
		.prop('disabled', false)
		.prop('checked', true);
		$(this).click(function(){
			input[0].checked = !(input[0].checked);
			$('div.filterPanel-container input[data-type="dow-day"]').prop('disabled',input[0].checked);
		});
	})
	.end()
	.find('div.filterPanel-dowItem:not(div.dow-Any)').each(function(){
		var input = $(this).find('input');
		input
		.attr('data-type','dow-day')
		.prop('disabled',true);
		$(this).click(function(){
			if(!$('div.filterPanel-container input[data-type="dow-any"]').prop('checked')) {
				input[0].checked = !(input[0].checked);
			}
		});
	})
	.end()
	.append(
		$('<button>')
		.text('Close')
		.click(function(e){
			$('div.filterPanel-container').hide();
		})
		.button()
	)
	.append(
		$('<button>')
		.text('Apply')
		.click(function(e){
			//-- Clean up previous settings for 'filter-hidden' and 'filter-shown' classes
			$('.filter-hidden').removeClass('filter-hidden');
			$('.filter-shown').removeClass('filter-shown');
			//-- Handling dayes-of-the-week
			var dowItems = $('div.filterPanel-container input[data-type="dow-day"]:checked');
			var dowSelector = '';
			if($('div.filterPanel-container input[data-type="dow-any"]').prop('checked') === false) {
				dowItems.each(function(){
					dowSelector += $(this).attr('data-val') + ' ';
				});
				if(dowSelector !== '') {
					$('.filter-all:not(.filter-genInfo):not(.filter-dow-' + dowSelector.trim().replace(/\s+/g,'-') + ')').addClass('filter-hidden');
				}
				else {
					$('.filter-all:not(.filter-genInfo)').addClass('filter-hidden');
				}
			}
			//-- General info div
			if($('div.filterPanel-genInfo').find('input')[0].checked) {
				$('.filter-genInfo').addClass('filter-hidden');
			}
			//-- Closed sections
			if($('div.filterPanel-closedSection').find('input')[0].checked) {
				$('.filter-closedSection').addClass('filter-hidden');
			}
			//-- Show all filtered items that don't have .filter-hidden class
			$('.filter-all:not(.filter-hidden)').addClass('filter-shown').show();
			//-- Hide all items that have .filter-hidden class
			$('.filter-hidden').hide();
			//-- Hide empty tables
			$('.filter-allTables table').each(function(index){
				var entriesToHideOrShow = $(this);
				if($(this).find('tr.filter-shown').length === 0) {
					entriesToHideOrShow.hide();
				}
				else {
					entriesToHideOrShow.show();
				}
			});
			//-- Scroll to stored position
			if($(window).data('topRow') !== null) {
				smoothScrollTo($(window).data('topRow').offset().top);
			}
		})
		.button()
	)
	/*
	.append(
		$('<button>')
		.text('Save')
		.click(function(e){
			console.log(JSON.stringify($('div.filterPanel-container form').formParams(true)));
		})
		.button()
	)
	*/
	.find('input').click(function(e){
		this.checked = !(this.checked);
	})
	.end()
	.hide();

	$('#filterTrigger').text('Filter').after($(filterContent)).button().draggable();
	$('#filterTrigger').click(function(e){
		$('div.filterPanel-container')
		.css({
			'left' : ($(window).width() - $('div.filterPanel-container').width())/2,
			'top' : $('#filterTrigger').position().top + (isMobile() ? 0 : $('#filterTrigger').height() + 20)
		})
		.toggle();
	});
	$('div.filterPanel-container').draggable();
	//-- Mapping between instructor's name and table-row where this instructor is listed
	nameMap = {};
	//-- Mapping between location code and map data in HTML
	locMap = {};
	//-- Navigation bar with letters
	var alphabet = "# A B C D E F G H I J K L M N O P Q R S T U V W X Y Z".split(/\s+/gi);
	$('div.filterPanel-container')
	.after(
		$('<div class="drag-container">')
		.append(
			$('<div class="navigation-letters">')
			.on('draginit', function(ev, drag) {
				drag.limit($(this).parent());
				drag.vertical();
			})
			.on('dragend', function(ev, drag) {
				if($(this).parent().within(ev.pageX,ev.pageY).length === 0) {
					drag.revert(true);
				}
			})
		)
	);
	$('div.navigation-letters')
	.append(
		$('<table>')
	);
	$.each(alphabet, function(letter) {
		$('div.navigation-letters table')
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
	$('div.navigation-letters table tr:eq(0)').each(function(){
		$(this).find('a').attr({
			'href' : '#',
			'title' : 'Top of the page'
		});
		$(this).show();
	});
	if(getDeviceType() === 'phone') {
		$('div.navigation-letters').css('font-size','90%');
	}
	//-- Iterate through tables (each subject letter is associated with a table)
	$('div.filter-allTables table')
	.each(function(table_index){
		//-- Skip certain tables if needed (!== 12 for 'T')
		//if(table_index !== 12) {
		if(table_index < 0) {
			return true;
		}
		//-- Remove HTML attributes from TD and TH
		$(this).find('th,td').removeAttr('valign').removeAttr('width').removeAttr('align');
		//-- Discover table layout to find indeces of 'td' where course description and instructor name are stored
		var firstRow = $(this).find('tr:eq(0)');
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
		var trLength = firstRow.find("th").length;
		//-- Identiy 'first letter' of listed courses and add hidden anchor just before the table for navigation purposes
		var tableLetter = $(this).find('tr:eq(1) td:eq(' + tdIndexSubj + ')').text().trim().substring(0,1);
		$(this).before($('<a>').attr({'href':'','name':tableLetter}));
		$('.navigation-letters table tr').each(function(){
			if($(this).find('td:eq(0) a').text() === tableLetter) {
				$(this).show();
			}
		});
		//-- Identify and mark header columns to be hidden in mobile view
		firstRow.find('th:eq(' + tdIndexPTRM + '),th:eq(' + tdIndexCredHours + '),th:eq(' + tdIndexTotalSeats + '),th:last-of-type').addClass('filter-antimobile');
		//-- Iterate through all table rows
		$(this).find("tr:gt(0)").each(function(tr_index){
			var tr = $(this);
			tr.find('td:eq(' + tdIndexPTRM + '),td:eq(' + tdIndexCredHours + '),td:eq(' + tdIndexTotalSeats + '),td:last-of-type').addClass('filter-antimobile');
			var days = tr.find("td:eq(" + tdIndexDays + ")").text().trim();
			var subj = tr.find("td:eq(" + tdIndexSubj + ")").text().trim();
			var numb = tr.find("td:eq(" + tdIndexNumb + ")").text().trim();
			var desc = tr.find("td:eq(" + tdIndexTitle + ")").text().trim();
			var CRN = tr.find("td:eq(" + tdIndexCRN + ")").text().trim();
			//-- Conditionally assign classes that will be used for filtering
			//-- Day of the week
			if(days !== '') {
				tr.addClass('filter-dow-' + days.replace(/\s+/gi,'-'));
			}
			else {
				if(tr.find('td').last().text().trim().toLowerCase().match(/online|ecore|emajor/) !== null) {
					tr.addClass('filter-dow-O');
				}
				else {
					tr.addClass('filter-dow-U');
				}
			}
			//-- Closed section
			if(tr.find("td:eq(" + tdIndexStatus + ")").text().trim() === 'C') {
				tr.addClass('filter-closedSection');
				if(tr.next().find("td:eq(" + tdIndexSubj + ")").text().trim() === '') {
					tr.next().addClass('filter-closedSection');
				}
			}
			tr.addClass('filter-all filter-shown');
			//-- Process non-empty 'subject' entries
			if(subj === "") {
				if(tr.prev().find('td').length === tr.find('td').length) {
					var prevSubj = tr.prev().find("td:eq(" + tdIndexSubj + ")").text().trim();
					var prevCRN = tr.prev().find("td:eq(" + tdIndexCRN + ")").text().trim();
					var prevNumb = tr.prev().find("td:eq(" + (tdIndexTitle-1) + ")").text().trim();
					tr.find("td:eq(" + tdIndexTitle + ")").text('Lab session for \'' + prevSubj + ' ' + prevNumb + '\' (CRN:' + prevCRN + ')');
				}
				else {
					tr.find("td:eq(" + tdIndexTitle + ")").text('Lab session for hidden course');
				}
			}
			else if(subj.length >= 3) {
				var anchor = subj + '_' + numb;
				tr.attr({'href':'#'+anchor,'name':anchor,'data-crn':CRN}).find("td:eq(" + tdIndexTitle + ")").empty().append($('<a href="#">').text(desc).click(function(){
					if(tr.next().find('td').length == 1) {
						tr.next().toggle('fast').toggleClass(tr.attr('class'));
					}
					else {
						tr.after($("<tr>").append($('<td class="desc-container" colspan="' + trLength + '">')));
						var container = tr.next().addClass(tr.attr('class')).find('td');
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
				}));
			}
			//-- Location pre-processing
			var loc = tr.find("td:eq(" + tdIndexLoc + ")").text().trim().split(" ")[0];
			if(!(loc in locMap)) {
				locMap[loc] = {};
				locMap[loc].td = [];
			}
			locMap[loc].td.push(tr.find("td:eq(" + tdIndexLoc + ")"));
			//-- Instructor name pre-processing
			var td = tr.find("td:eq(" + tdIndexInstructor + ")");
			var name = td.text().trim();
			if(!(name in nameMap)) {
				nameMap[name] = {};
				nameMap[name].td = [];
			}
			nameMap[name].td.push(td);
		});
	});
	//-- Location post-processing
	var buildingData = getBuildingData();
	for(var key in locMap) {
		(function(loc){
			if(loc in buildingData) {
				locMap[loc].buildingData = buildingData[loc];
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
		})(key);
	}
	//-- Instructor name post-processing
	for(var key in nameMap) {
		(function(name){
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
		})(key);
	}
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
		/*
		if($(window).data('topRow') !== null) {
			smoothScrollTo($(window).data('topRow').offset().top);
		}
		*/
	},1000);
}
$(window).resize(function(){
	$('.navigation-letters').css({
		'left': '0px',//$(this).width() - $('.navigation-letters').width() - 5,
		'top':($(window).height() - $('.navigation-letters').height())/2
	});
	$('#filterTrigger')
	.css({
		'left':$(window).width()/2-$('#filterTrigger').width()/2,'top':'auto'
	});
	$('div.filterPanel-container')
	.css({
		'left' : ($(window).width() - $('div.filterPanel-container').width())/2,
		'top' : $('#filterTrigger').position().top + (isMobile() ? 0 : $('#filterTrigger').height() + 20)
	});
});
$(document).keydown(function(e){
	var code = e.keyCode ? e.keyCode : e.which;
	var filterPanel = $('.filterPanel-container');

	if(code === 27) {
		$('.tooltip').tooltipster('hide');
	}
	if(filterPanel.filter(':hidden').length === 0) {
		if(code === 27) {
			filterPanel.hide();
		}
		else if(code === 13) {
			filterPanel.find('button').trigger('click');
		}
	}
});
$(window).load(function(){
	//-- Minimalistic interface and version control
	var mini = getMini();
	var version = getVersion();
	if(localStorage.getItem('sched.param(mini)') !== mini || localStorage.getItem('sched.param(version)') !== version) {
		localStorage.clear();
		console.log('Local storage cleared');
	}
	localStorage.setItem('sched.param(mini)', mini);
	localStorage.setItem('sched.param(version)', version);
	//-- Debug flag: if enabled via GET ver=1
	localStorage.setItem('sched.param(debug)', getDebug());
	//-- Strore schedule term in localStorage
	localStorage.setItem('sched.param(term)', getTerm().replace(/[^0-9]/g,''));
	//-- Load data from RAIN schedule
	$(window).data('topRow',null);
	$.get('raintaker.php?schedterm=' + getTerm(), function(data){
		scheduleProcessor(data);
		$('#filterTrigger').repeat(1000).toggleClass('ui-state-hover').wait(50).toggleClass('ui-state-hover');
		$(window).trigger('resize');
	});
});
