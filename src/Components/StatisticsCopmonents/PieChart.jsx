import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';

export default function BasicPie({ QuickMemoryGame = 0, Catch5Game = 0, ColorShadeGame = 0, SaccadeClockGame = 0, ScanningGame = 0 }) {
    return (
        <PieChart
        
            series={[
                {
                    data: [
                        { id: 0, value: QuickMemoryGame, label: 'משחק זכרון' },
                        { id: 1, value: Catch5Game, label: 'לתפוס 5' },
                        { id: 2, value: ColorShadeGame, label: 'צבעים' },
                        { id: 3, value: SaccadeClockGame, label: 'סקאדת שעון' },
                        { id: 4, value: ScanningGame, label: 'סריקה' },
                    ], highlightScope: { fade: 'global', highlight: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' }
                },
            ]}
            width={400}
            height={300}
        />
    );
}