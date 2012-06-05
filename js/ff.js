(function ($) {
  
	$(document).ready(function() {

		var pathname = window.location.pathname.split("/")[2];
		// Object that holds food-type totals and their limits
		var foodTypeCount = {
			"totalProtein":0
			, "noCarbProtein":0
			, "loCarbProtein":0
			, "hiCarbProtein":0
			, "vegetables":0
			, "starches":0
			, "weight-loss-plan-ketosis": {
				"totalProteinLimit":35
				, "noCarbProteinLimit":35
				, "loCarbProteinLimit":14
				, "hiCarbProteinLimit":7
				, "vegetablesLimit":0
				, "starchesLimit":0
			}
			, "weight-loss-plan-week-2": {
				"totalProteinLimit":28
				, "noCarbProteinLimit":28
				, "loCarbProteinLimit":14
				, "hiCarbProteinLimit":7
				, "vegetablesLimit":14
				, "starchesLimit":0
			}
			, "weight-loss-plan-week-4": {
				"totalProteinLimit":28
				, "noCarbProteinLimit":28
				, "loCarbProteinLimit":14
				, "hiCarbProteinLimit":7
				, "vegetablesLimit":0
				, "starchesLimit":7
			}
			, "total-daily-plan": {
				"totalProteinLimit":35
				, "noCarbProteinLimit":35
				, "loCarbProteinLimit":14
				, "hiCarbProteinLimit":7
				, "vegetablesLimit":14
				, "starchesLimit":7
			}
			, "go-plan": {
				"totalProteinLimit":14
				, "noCarbProteinLimit":14
				, "loCarbProteinLimit":14
				, "hiCarbProteinLimit":14
				, "vegetablesLimit":14
				, "starchesLimit":14
			}
			, "mid-day-plan": {
				"totalProteinLimit":21
				, "noCarbProteinLimit":21
				, "loCarbProteinLimit":14
				, "hiCarbProteinLimit":7
				, "vegetablesLimit":0
				, "starchesLimit":0
			}
			, "efficiency-plan": {
				"totalProteinLimit":28
				, "noCarbProteinLimit":28
				, "loCarbProteinLimit":14
				, "hiCarbProteinLimit":7
				, "vegetablesLimit":7
				, "starchesLimit":0
			}
			, "2nd-half-day": {
				"totalProteinLimit":21
				, "noCarbProteinLimit":21
				, "loCarbProteinLimit":14
				, "hiCarbProteinLimit":7
				, "vegetablesLimit":7
				, "starchesLimit":0
			}
		};
		// Object that matches food-types to CSS classes
		var foodTypes = {
			"foodtype4": [
				"totalProtein"
				, "noCarbProtein"
			]
			, "foodtype3": [
				"totalProtein"
				, "loCarbProtein"
			]
			, "foodtype2": [
				"totalProtein"
				, "hiCarbProtein"
			]
			, "foodtype6": [
				"vegetables"
			]
			, "foodtype5": [
				"starches"
			]
		};

		// If this is a page that has a path in the foodTypeCount object, 
		// move input:select divs where they belong, by Drupal class selector.
		if(pathname && foodTypeCount[pathname]) {
			var matchedDivs = $('.field-widget-options-select');
			moveProductOptionDivs(matchedDivs, foodTypeCount, foodTypes, pathname);
		}

	});


	function moveProductOptionDivs(matchedDivs, foodTypeCount, foodTypes, pathname) {

		tabIndexMultiplier = 1;
		
		for(var i = 0; i < matchedDivs.length; i++) {

			var matchedDivId = matchedDivs[i].id;
			var capturedIdFoodCode = matchedDivId.match(/edit-\d\d-field-bundle-(.*?)-field.*/);
			var appendToDiv = $("div[id$=" + capturedIdFoodCode[1] + "-product-id]");
			var foodTypeClass = appendToDiv.parent().attr('class');
			var foodTypeLimitStr = foodTypes[foodTypeClass][1] ? foodTypes[foodTypeClass][1] + 'Limit' : foodTypes[foodTypeClass][0] + 'Limit';
			var dailyLimit = foodTypeCount[pathname][foodTypeLimitStr] / 7;
			appendToDiv.parent().next('input').val(0);
			$(matchedDivs[i]).children().children().children('option[value="_none"]').remove();

			for(var j = 10; j > dailyLimit; j--) {
				$(matchedDivs[i]).children().children().children('option[value=' + j + ']').remove();
			}

			$(matchedDivs[i]).children().children('select').data('prev', 0);
			$(matchedDivs[i]).children().children('select').addClass(foodTypeClass);
			$(matchedDivs[i]).children().children('select').attr('tabindex', (7 - (i % 7)) + (7 * Math.floor(i / 7)));

			$(matchedDivs[i]).children().children('select').bind('change', function(e) {
				e.preventDefault();
				addToTotals(foodTypeClass, foodTypeCount, foodTypes, $(this), pathname);
				// Logging...
				console.log($(this).parent().parent().parent().parent().next('input').attr('name') + " currentQty is " + $(this).parent().parent().parent().parent().next('input').val());
			});

			appendToDiv.append(matchedDivs[i]);

		}

	}


	function addToTotals(foodTypeClass, foodTypeCount, foodTypes, select, pathname) {

		var currentFoodTypeClass = select.attr('class').split(" ")[1];
		var currentFoodTypes = foodTypes[currentFoodTypeClass];
		var qtyIncremented = false;
		var increment = 0;
		var messages = {
			"totalProtein": "Total Proteins"
			, "noCarbProtein": "No-Carb Proteins"
			, "loCarbProtein": "Lo-Carb Proteins"
			, "hiCarbProtein": "Hi-Carb Proteins"
			, "vegetables": "Vegetables"
			, "starches": "Starches"
		}

		for (var i = 0; i < currentFoodTypes.length; i++) {
			var tempFoodType = currentFoodTypes[i];
			var tempFoodTypeLimitKey = tempFoodType + "Limit";
			var tempIncrement = parseInt(select.children('option:selected').text());
			increment = (increment == 0) ? (tempIncrement - parseInt(select.data('prev'))) : increment;
			var tempTotal = foodTypeCount[tempFoodType] + increment;
			var overage = false;

			if(tempTotal < foodTypeCount[pathname][tempFoodTypeLimitKey]) {
				foodTypeCount[tempFoodType] = tempTotal;
				select.data('prev', tempIncrement);
			} else if(tempTotal == foodTypeCount[pathname][tempFoodTypeLimitKey]) {
				foodTypeCount[tempFoodType] = tempTotal;
				select.data('prev', tempIncrement);
				alert("Your " + messages[tempFoodType] + " are now at their weekly limit.");
			} else {
				overage = true;
				alert("This puts your " + messages[tempFoodType] + " over their weekly limit! Try a smaller number.");
			}

			if(overage) {
				select.val(select.data('prev')).attr('selected', true);
				break;
			} else if(!qtyIncremented) {
				var currentQty = parseInt(select.parent().parent().parent().parent().next('input').val());
				var subTotal = currentQty + increment;
				select.parent().parent().parent().parent().next('input').val(subTotal);
				qtyIncremented = true;
			}
		}

		// Logging...
		console.log("totalProtein is " + foodTypeCount.totalProtein);
		console.log("noCarbProtein is " + foodTypeCount.noCarbProtein);
		console.log("loCarbProtein is " + foodTypeCount.loCarbProtein);
		console.log("hiCarbProtein is " + foodTypeCount.hiCarbProtein);
		console.log("vegetables is " + foodTypeCount.vegetables);
		console.log("starches is " + foodTypeCount.starches);

	}

})(jQuery);

