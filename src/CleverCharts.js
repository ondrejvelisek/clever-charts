
import Doughnut from "./doughnut/Doughnut";
import Histogram from "./histogram/Histogram";
import Line from "./line/Line";

import BarLegacy from "./bar/Bar";

import Barchart from "./barchart/components/Barchart";

import StripeData from "./barchart/data/StripeData";
import BarData from "./barchart/data/BarData";
import DetailsData from "./barchart/data/DetailsData";
import BarchartData from "./barchart/data/BarchartData";
import TooltipData from "./barchart/data/TooltipData";
import Stripe from "./barchart/components/Stripe";
import BarchartBackport from "./barchart/components/BarchartBackport";

export default {
	Bar:BarLegacy,

	Barchart:Barchart,
	BarchartBackport:BarchartBackport,
	Stripe:Stripe,

	BarchartData:BarchartData,
	BarData:BarData,
	DetailsData:DetailsData,
	StripeData:StripeData,
	TooltipData:TooltipData,

    Doughnut:Doughnut,
    Histogram:Histogram,
    Line:Line
}