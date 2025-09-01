export type PrefCode =
 '01'|'02'|'03'|'04'|'05'|'06'|'07'|'08'|'09'|'10'|'11'|'12'|'13'|'14'|'15'|'16'|'17'|'18'|'19'|'20'|
 '21'|'22'|'23'|'24'|'25'|'26'|'27'|'28'|'29'|'30'|'31'|'32'|'33'|'34'|'35'|'36'|'37'|'38'|'39'|'40'|
 '41'|'42'|'43'|'44'|'45'|'46'|'47';
export type VisitStatus = 'none'|'passed'|'visited'|'lived';

export type JapanMapProps = {
  values: Partial<Record<PrefCode, VisitStatus>>;
  showLabels: boolean;
  palette: { visited: string; lived: string; passed: string; none: string; stroke: string; };
  strokeWidth: number;
  labelKind: 'pref'|'capital'|'none';
  onChange?: (next: JapanMapProps['values']) => void;
  onHover?: (code: PrefCode | null) => void;
};
