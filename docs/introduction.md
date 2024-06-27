## Introduction

Air temperatures and water temperatures in streams are coupled in interesting and complex ways across streams. Early efforts to understand the relationships between the two tempratures relied on simply estimating the relationshop between water temperatrue and air temperature. If air and water are completetely coupled, the slope of the relationship between the two temperatures will be 1.0. However, if the two temperatures are less coupled, the slope of the relationship should be less than 1.0 and the closer to 0, the less coupled and the more other variables such as groundwater input drive water temperatures.  
  
Recently, researchers have explored the relationship between air and water temperatures in streams using time series data and the assumption that the data follow `sin` functions. The extent of coupling between air and water temperatures can be explored by estimating the phase shift (lag) and amplitude difference between curves for air and water.  
  
In addition to the slope of the relationship between air and water temperatures and phase shift and amplitude differences between air and water temperature time series data, we also present a new approach that uses differential equations (`de`) to estimate the relationship rather than `sin` curves. This approach is more flexible than using a fixed function and also provides attional information. With this explorer, you can compare the two approaches.  

The `de` approach fits an ordinary differential equation for heat transfer:  

${tex`\frac{dT_w}{dt} = k \left( p(T_g - T_w) + (1-p)(T_a-T_w) \right)`}

where ${tex`T_w`} is air temperature, ${tex`T_g`} is groundwater temperature, ${tex`T_a`} is air temperature, ${tex`k`} is a composite measure of stream sensitivity to external (air or groundwater) temperatures, and ${tex`p`} is the proportion of thermal control exerted by groundwater.

When the input ${tex`T_a`} is sinusoidal (and ${tex`T_g`} is constant), the solution for ${tex`T_w`} is a damped, lagged, and shifted wave, and from this solution PAWT metrics can be calculated that are equivalent to the standard method. More generally, given an arbitrary input ${tex`T_a`}, the resulting ${tex`T_w`} trajectory can be found numerically. Here, we define the input ${tex`T_a(t)`} to be a linear interpolation of logged air temperatures. The ODE parameters are then estimated by minimizing the RMSE between predicted and measured water temperatures ${tex`T_w`}.  

The `de` approach provides the intruiging possibility of not only estimating the relationships between air and water temperatures, but also the addtional parameters ${tex`k`} and ${tex`p`} which could generate novel insights into groupdwater control of stream temperatures.
