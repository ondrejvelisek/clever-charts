
import Doughnut from "./doughnut/Doughnut";
import Histogram from "./histogram/Histogram";
import Line from "./line/Line";
import BarLegacy from "./bar/Bar";
import Barchart from "./barchart/components/Barchart";
import BarchartBackport from "./barchart/components/BarchartBackport";

export default {
	Bar:BarchartBackport,
	Barchart:Barchart,
	BarLegacy:BarLegacy,

    Doughnut:Doughnut,
    Histogram:Histogram,
    Line:Line
}