import BarchartData from "./data/BarchartData";
import DetailsData from "./data/DetailsData";
import TooltipData from "./data/TooltipData";
import BarData from "./data/BarData";
import StripeData from "./data/StripeData";

class JsonDataConverter {

	convert(barchartJsonData) {

		let detailsData;
		if (typeof barchartJsonData.details !== 'undefined') {
			let tooltipsData;
			if (typeof barchartJsonData.details.tooltips !== 'undefined') {
				tooltipsData = barchartJsonData.details.tooltips.map(
					tooltipJsonData => new TooltipData(tooltipJsonData)
				);
			}
			detailsData = new DetailsData(barchartJsonData.details, tooltipsData);
		}

		const barsData = barchartJsonData.bars.map(barJsonData => {

			let detailsData;
			if (typeof barJsonData.details !== 'undefined') {
				let tooltipsData;
				if (typeof barJsonData.details.tooltips !== 'undefined') {
					tooltipsData = barJsonData.details.tooltips.map(
						tooltipJsonData => new TooltipData(tooltipJsonData)
					);
				}
				detailsData = new DetailsData(barJsonData.details, tooltipsData);
			}

			const stripesData = barJsonData.stripes.map(stripeJsonData => new StripeData(stripeJsonData));

			return new BarData(barJsonData, detailsData, stripesData);
		});

		const barchartData = new BarchartData(barchartJsonData, detailsData, barsData);

		return barchartData;

	}

}

export default JsonDataConverter;
