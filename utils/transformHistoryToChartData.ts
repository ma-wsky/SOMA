interface MyChartData {
    labels: string[];
    datasets: [
        {
            data: number[];
        }
    ];
}

export const transformHistoryToChartData = (history: any[]): MyChartData | null => {
    if (!history.length) return null;

    const bestPerDay = new Map<string, { label: string; weight: number; ts: number }>();

    history.forEach((set) => {
        const dayKey = set.date.toISOString().split('T')[0];
        const weight = Number(set.weight) || 0;
        const existing = bestPerDay.get(dayKey);

        if (!existing || weight > existing.weight) {
            bestPerDay.set(dayKey, {
                label: `${set.date.getDate()}.${set.date.getMonth() + 1}.`,
                weight,
                ts: set.timestamp
            });
        }
    });

    const sorted = Array.from(bestPerDay.values()).sort((a, b) => a.ts - b.ts).slice(-6);

    return {
        labels: sorted.map(d => d.label),
        datasets: [{data: sorted.map(d => d.weight)}]
    };
};
