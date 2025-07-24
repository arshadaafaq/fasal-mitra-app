import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MarketPrice {
  crop: string;
  price: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  market: string;
}

interface MarketPriceCardProps {
  prices: MarketPrice[];
}

const MarketPriceCard = ({ prices }: MarketPriceCardProps) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-crop-green" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-crop-green';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="w-full shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-forest-green">
          <span>💰</span>
          Today's Market Prices
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prices.map((price, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-gradient-earth border border-border hover:shadow-soft transition-all duration-300"
            >
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{price.crop}</h4>
                <p className="text-sm text-muted-foreground">{price.market}</p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-foreground">
                    ₹{price.price}/{price.unit}
                  </span>
                  {getTrendIcon(price.trend)}
                </div>
                
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-sm font-medium ${getTrendColor(price.trend)}`}>
                    {price.change > 0 ? '+' : ''}{price.change}%
                  </span>
                  <Badge 
                    variant={price.trend === 'up' ? 'default' : price.trend === 'down' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {price.trend === 'up' ? 'Sell Now' : price.trend === 'down' ? 'Hold' : 'Stable'}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-crop-green/10 rounded-lg border border-crop-green/20">
          <p className="text-sm text-crop-green font-medium">
            💡 Tip: Tomato prices are trending up. Consider selling within next 2 days for maximum profit.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketPriceCard;